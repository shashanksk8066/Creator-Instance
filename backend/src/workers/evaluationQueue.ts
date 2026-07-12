import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { db } from '../config/firebase';
import { autoDmQueue } from './dmQueue';
import fs from 'fs';
import path from 'path';

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

export const evaluationQueue = new Queue('evaluation-queue', {
  connection: redisConnection as any
});

// Simple in-memory cache for rules to handle viral bursts without hitting Firestore
const rulesCache: Record<string, { rules: any[], expiresAt: number }> = {};
const CACHE_TTL = 60000; // 60 seconds

const worker = new Worker('evaluation-queue', async (job: Job) => {
  const { value, igAccountId } = job.data;
  const { id: commentId, text, from, media, parent_id } = value;
  const igUserId = from?.id;
  const mediaId = media?.id;

  if (!igUserId || !mediaId || !text) {
    return;
  }

  // Ignore comment replies
  if (parent_id) {
    appendLog('IGNORED_REPLY', { commentId, parent_id, text });
    return;
  }

  // Prevent infinite loops
  if (igUserId === igAccountId) {
    appendLog('IGNORED_SELF_COMMENT', { igUserId, igAccountId, text });
    return;
  }

  try {
    // 1. Fetch rules from cache or Firestore
    const cacheKey = `rules:${mediaId}`;
    let rules: any[] = [];

    if (rulesCache[cacheKey] && rulesCache[cacheKey].expiresAt > Date.now()) {
      rules = rulesCache[cacheKey].rules;
    } else {
      const rulesSnapshot = await db.collection('auto_dm_rules')
        .where('status', '==', 'active')
        .where('selectedPosts', 'array-contains', mediaId)
        .get();
      
      rules = rulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      rulesCache[cacheKey] = { rules, expiresAt: Date.now() + CACHE_TTL };
    }

    if (rules.length === 0) {
      return;
    }

    let matchedRule: any = null;
    const commentText = text.toLowerCase().trim();

    for (const rule of rules) {
      if (rule.triggerType === 'any') {
        matchedRule = rule;
        break;
      } else if (rule.triggerType === 'keyword' && rule.keywords) {
        const hasMatch = rule.keywords.some((k: string) => commentText.includes(k));
        if (hasMatch) {
          matchedRule = rule;
          break;
        }
      }
    }

    if (!matchedRule) {
      appendLog('NO_MATCHING_RULE_FOUND', { commentText, mediaId, igAccountId });
      return;
    }

    // 1.5 Redis Deduplication Check (Atomic SET NX to block simultaneous bursts)
    const dupKey = `sent_dm:${matchedRule.id}:${igUserId}`;
    const isDuplicate = await redisConnection.set(dupKey, '1', 'EX', 86400, 'NX');
    if (!isDuplicate) {
      appendLog('SKIPPED_DUPLICATE', { ruleId: matchedRule.id, igUserId });
      return;
    }

    // 2. Verified as a valid actionable comment! Calculate the delayed slot.
    const now = Date.now();
    const slotKey = `next_available_slot:${igAccountId}`;
    
    const currentSlotRaw = await redisConnection.get(slotKey);
    const previousSlotTime = currentSlotRaw ? parseInt(currentSlotRaw, 10) : 0;
    
    // Target Send Time = Max(Time Commented + 18s, Previous DM Sent + 18s)
    const targetSlotTime = Math.max(now + 18000, previousSlotTime + 18000);
    
    // Save this target slot as the new "previousSlotTime" for the next comment
    await redisConnection.set(slotKey, targetSlotTime);
    
    // Calculate base delay
    let baseDelay = targetSlotTime - now;
    
    // Dynamic Jitter: Random delay between 5000ms and 15000ms
    const jitter = Math.floor(Math.random() * (15000 - 5000 + 1) + 5000);
    const finalDelay = baseDelay + jitter;

    // 3. Add to the dispatch queue and increment pending counter
    await redisConnection.incr(`pending_dms:${igAccountId}`);
    await autoDmQueue.add('send-dm', { ...job.data, matchedRule }, {
      delay: finalDelay,
      removeOnComplete: true,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 60000 
      }
    });

  } catch (err: any) {
    appendLog('ERROR_EVALUATING_COMMENT', { error: err.message });
    console.error('Error evaluating comment:', err);
    throw err;
  }
}, { 
  connection: redisConnection as any,
  concurrency: 50 // High concurrency for fast filtering
});

worker.on('failed', async (job: Job | undefined, err: Error) => {
  console.error(`Evaluation Job ${job?.id} failed:`, err);
});
