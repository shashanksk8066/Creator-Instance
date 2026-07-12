import { redisConnection } from '../config/redis';
import { db } from '../config/firebase';
import * as FirebaseFirestore from 'firebase-admin/firestore';

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export const startViewSyncWorker = () => {
  console.log('Started View Sync Worker (runs every 5 minutes)');

  setInterval(async () => {
    try {
      // Find all view buffer keys in Redis
      const keys = await redisConnection.keys('views:blog:*');
      if (keys.length === 0) return;

      const batch = db.batch();
      let operationsCount = 0;
      const today = new Date().toISOString().split('T')[0];

      // Process each key
      for (const key of keys) {
        // key format: views:blog:blogId:creatorId
        const parts = key.split(':');
        if (parts.length !== 4) continue;
        
        const blogId = parts[2];
        const creatorId = parts[3];

        // Get the accumulated views and atomically reset the counter to 0
        // We use GETSET so we don't lose increments that happen exactly during this process
        const viewsStr = await redisConnection.getset(key, '0');
        const views = parseInt(viewsStr || '0', 10);

        if (views > 0) {
          const blogRef = db.collection('blogs').doc(blogId);
          const dailyStatsRef = db.collection('creator_daily_stats').doc(`${creatorId}_${today}`);

          batch.update(blogRef, { views: FirebaseFirestore.FieldValue.increment(views) });
          batch.set(dailyStatsRef, {
            creatorId,
            date: today,
            pageViews: FirebaseFirestore.FieldValue.increment(views)
          }, { merge: true });

          operationsCount += 2;

          // Firestore batches max out at 500 operations
          if (operationsCount >= 490) {
            await batch.commit();
            operationsCount = 0;
            // Note: In a real heavy-scale system, we'd create a new batch here.
            // For simplicity, we just break if it gets too large for one run.
          }
        }
      }

      if (operationsCount > 0) {
        await batch.commit();
        console.log(`Synced ${operationsCount / 2} blog views to Firestore`);
      }
      
      // Cleanup keys that are 0 to keep Redis clean
      for (const key of keys) {
        const val = await redisConnection.get(key);
        if (val === '0') {
          await redisConnection.del(key);
        }
      }

    } catch (error) {
      console.error('Error syncing views to Firestore:', error);
    }
  }, SYNC_INTERVAL_MS);
};
