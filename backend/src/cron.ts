import cron from 'node-cron';
import { runAdsterraSync, runMonthlyRollover } from './controllers/adminController';

export const initCronJobs = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Starting hourly Adsterra Revenue Sync...');
    try {
      await runAdsterraSync();
      console.log('[CRON] Adsterra Revenue Sync completed successfully.');
    } catch (error) {
      console.error('[CRON] Adsterra Revenue Sync failed:', error);
    }
  }, {
    timezone: "Asia/Kolkata"
  });

  // Run on the 1st of every month at 10:00 AM for Monthly Rollover
  cron.schedule('0 10 1 * *', async () => {
    console.log('[CRON] Starting Monthly Balance Rollover...');
    try {
      await runMonthlyRollover();
      console.log('[CRON] Monthly Balance Rollover completed successfully.');
    } catch (error) {
      console.error('[CRON] Monthly Balance Rollover failed:', error);
    }
  }, {
    timezone: "Asia/Kolkata"
  });

  console.log('[CRON] Background jobs initialized.');
};
