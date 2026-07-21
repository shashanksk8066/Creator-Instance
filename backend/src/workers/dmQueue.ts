import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { db } from '../config/firebase';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { buildButtonTemplate } from '../utils/messageBuilder';

const logFile = path.resolve(__dirname, '../../test.log');

const appendLog = (msg: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logStr = data ? `${timestamp} - ${msg}\n${JSON.stringify(data, null, 2)}\n\n` : `${timestamp} - ${msg}\n\n`;
  try {
    fs.appendFileSync(logFile, logStr);
  } catch (e) {
    console.error('Failed to write to log file', e);
  }
};

const parseSpintax = (text: string) => {
  if (!text) return text;
  return text.replace(/\{([^{}]+)\}/g, (match, contents) => {
    const parts = contents.split('|').filter((p: string) => p.trim() !== '');
    if (parts.length === 0) return '';
    return parts[Math.floor(Math.random() * parts.length)];
  });
};

export const autoDmQueue = new Queue('auto-dm-queue', {
  connection: redisConnection as any
});

const worker = new Worker('auto-dm-queue', async (job: Job) => {
  const { value, igAccountId, matchedRule } = job.data;
  const { id: commentId, text, from, media } = value;
  const igUserId = from?.id;
  const mediaId = media?.id;

  if (!igUserId || !mediaId || !text || !matchedRule) {
    if (igAccountId) await redisConnection.decr(`pending_dms:${igAccountId}`);
    return;
  }

  const matchedRuleId = matchedRule.id;

  try {

    const creatorDoc = await db.collection('users').doc(matchedRule.creatorId).get();
    if (!creatorDoc.exists) {
      appendLog('CREATOR_NOT_FOUND', { creatorId: matchedRule.creatorId });
      await redisConnection.decr(`pending_dms:${igAccountId}`);
      return;
    }
    
    const creator = creatorDoc.data();
    const instagramAccounts = creator?.instagramAccounts || {};
    const account = instagramAccounts[igAccountId] || instagramAccounts[matchedRule.accountId];
    const accessToken = account?.accessToken;
    if (!accessToken) {
      appendLog('ACCESS_TOKEN_MISSING', { igAccountId });
      await redisConnection.decr(`pending_dms:${igAccountId}`);
      return;
    }

    const blogDoc = await db.collection('blogs').doc(matchedRule.blogId).get();
    if (!blogDoc.exists || blogDoc.data()?.status !== 'Published') {
      appendLog('BLOG_NOT_FOUND_OR_NOT_PUBLISHED', { blogId: matchedRule.blogId });
      await redisConnection.decr(`pending_dms:${igAccountId}`);
      return;
    }
    const blog = blogDoc.data();

    const baseDomain = process.env.BASE_DOMAIN || 'localhost';
    const protocol = baseDomain === 'localhost' ? 'http' : 'https';
    // Remove any port from baseDomain for the URL construction if it has one, or leave it. 
    // Usually FRONTEND_URL is better. But we need subdomain.
    let domain = '';
    if (creator?.subdomain) {
      if (baseDomain === 'localhost') {
        domain = `http://${creator.subdomain}.localhost:5173`;
      } else {
        domain = `${protocol}://${creator.subdomain}.${baseDomain}`;
      }
    } else {
      domain = process.env.FRONTEND_URL || 'http://localhost:5173';
    }
    const blogUrl = `${domain}/blogs/${blog?.slug}`;

    let greeting = matchedRule.greeting ? parseSpintax(matchedRule.greeting) : '';
    let bodyText = matchedRule.body ? parseSpintax(matchedRule.body) : '';

    let messageText = greeting ? `${greeting}\n\n` : '';
    messageText += bodyText ? `${bodyText}` : '';

    if (!messageText.trim()) {
      messageText = "Here is the information you requested.";
    }


    const messagePayload = buildButtonTemplate(messageText, matchedRule.ctaText, blogUrl);

    appendLog('GENERATED_MESSAGE_PAYLOAD', { messagePayload });

    const dmPayload = {
      recipient: { comment_id: commentId },
      message: messagePayload
    };
    
    appendLog('SENDING_DM', { url: `https://graph.instagram.com/v19.0/me/messages`, payload: dmPayload, igAccountId });

    let dmSuccess = false;
    let errorMsg = '';

    try {
      await axios.post(`https://graph.instagram.com/v19.0/me/messages`, dmPayload, {
        params: { access_token: accessToken }
      });
      dmSuccess = true;
    } catch (e: any) {
      errorMsg = e.response?.data?.error?.message || e.message;
      const errorCode = e.response?.data?.error?.code;
      console.error('Failed to send DM:', errorMsg);
      
      // 5. Automated Circuit Breaker for Meta Errors
      if (e.response?.status === 429 || errorCode === 100) {
        const slotKey = `next_available_slot:${igAccountId}`;
        const currentSlotRaw = await redisConnection.get(slotKey);
        const currentSlotTime = currentSlotRaw ? parseInt(currentSlotRaw, 10) : Date.now();
        await redisConnection.set(slotKey, Math.max(currentSlotTime, Date.now()) + 900000); // +15 mins
        throw new Error(`Instagram API Circuit Breaker Tripped: ${errorMsg}`);
      }
      
      // 6. Graceful Failure and Infinite Retries for Infrastructure Errors (System Errors only)
      if (e.response?.status >= 500) {
        throw new Error(`Instagram API System Error: ${errorMsg}`);
      }
      // User Errors (e.g. 400, 403) are intentionally not thrown so they do not trigger infinite retries
    }

    if (dmSuccess && matchedRule.publicReply) {
      try {
        await axios.post(`https://graph.instagram.com/v19.0/${commentId}/replies`, {
          message: matchedRule.publicReply
        }, {
          params: { access_token: accessToken }
        });
      } catch (e: any) {
        console.error('Failed to send public reply:', e.response?.data?.error?.message || e.message);
      }
    }

    await db.collection('auto_dm_logs').add({
      creatorId: matchedRule.creatorId,
      ruleId: matchedRuleId,
      commentId,
      igUserId,
      mediaId,
      status: dmSuccess ? 'success' : 'failed',
      errorMessage: errorMsg,
      timestamp: new Date().toISOString()
    });

    appendLog('EXECUTION_COMPLETE', { dmSuccess, errorMsg });
    
    // Successfully completed or gracefully failed without throwing (User Errors)
    await redisConnection.decr(`pending_dms:${igAccountId}`);

  } catch (err: any) {
    appendLog('ERROR_PROCESSING_COMMENT', { error: err.message });
    console.error('Error processing comment:', err);
    throw err; // Ensure BullMQ registers this as a failed job and retries
  }
}, { 
  connection: redisConnection as any,
  limiter: {
    max: 20,
    duration: 1000,
  }
});

worker.on('failed', async (job: Job | undefined, err: Error) => {
  console.error(`Job ${job?.id} failed with error:`, err);
  if (job && job.opts.attempts && job.attemptsMade >= job.opts.attempts) {
    // If it hit the max attempts, decrement because it is completely dead
    await redisConnection.decr(`pending_dms:${job.data.igAccountId}`);
  }
});
