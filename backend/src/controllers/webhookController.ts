import { Request, Response } from 'express';
import { db } from '../config/firebase';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { evaluationQueue } from '../workers/evaluationQueue';
import { redisConnection } from '../config/redis';

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

// Get Meta settings securely
const getMetaConfig = async () => {
  const doc = await db.collection('platform_settings').doc('meta_config').get();
  if (!doc.exists) throw new Error('Meta settings not configured');
  return doc.data();
};

export const verifyWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await getMetaConfig();
    const verifyToken = config?.webhookVerifyToken;

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(400);
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;
    appendLog('WEBHOOK_RECEIVED', body);

    if (body.object === 'instagram') {
      res.status(200).send('EVENT_RECEIVED');

      for (const entry of body.entry) {
        const igAccountId = entry.id;
        const changes = entry.changes;
        if (!changes) continue;

        for (const change of changes) {
          if (change.field === 'comments') {
            const commentId = change.value.id;
            const now = Date.now();
            
            // Webhook Deduplication: Prevent Instagram from sending duplicate webhooks for the same comment
            if (commentId) {
              const webhookDedupKey = `webhook_seen:${commentId}`;
              const isSeen = await redisConnection.set(webhookDedupKey, '1', 'EX', 3600, 'NX');
              if (!isSeen) {
                continue; // Skip processing duplicate webhook entirely
              }
            }
            
            // Send instantly to evaluationQueue for noise filtering
            await evaluationQueue.add('evaluate-comment', { value: change.value, igAccountId }, {
              removeOnComplete: true,
              attempts: 3,
              backoff: { type: 'exponential', delay: 5000 }
            });
          }
        }
      }
    } else {
      res.sendStatus(404);
    }
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    res.status(500).send('ERROR');
  }
};


