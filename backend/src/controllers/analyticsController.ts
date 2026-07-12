import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { redisConnection } from '../config/redis';

export const getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // 1. Fetch DM Logs
    const dmsSnap = await db.collection('auto_dm_logs')
      .where('creatorId', '==', uid)
      .get();
      
    let totalDMs = 0;
    let todayDMs = 0;
    let yesterdayDMs = 0;

    const dmHistorical: Record<string, number> = {};

    dmsSnap.forEach(doc => {
      const data = doc.data();
      if (data.status === 'success') {
        totalDMs++;
        const date = data.timestamp.split('T')[0];
        if (date === today) todayDMs++;
        if (date === yesterday) yesterdayDMs++;
        dmHistorical[date] = (dmHistorical[date] || 0) + 1;
      }
    });

    // 2. Fetch Creator Daily Stats (for page views)
    const statsSnap = await db.collection('creator_daily_stats')
      .where('creatorId', '==', uid)
      .get();

    let todayViews = 0;
    let yesterdayViews = 0;
    const viewsHistorical: Record<string, number> = {};

    statsSnap.forEach(doc => {
      const data = doc.data();
      const date = data.date;
      if (date === today) todayViews = data.pageViews || 0;
      if (date === yesterday) yesterdayViews = data.pageViews || 0;
      viewsHistorical[date] = data.pageViews || 0;
    });

    // 3. Fetch Revenue (if subdomain exists)
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    const subdomain = userData?.subdomain;
    
    // Fetch Active Queues from Redis based on user's connected accounts
    let activeQueues = 0;
    const instagramAccounts = userData?.instagramAccounts || {};
    for (const igAccountId of Object.keys(instagramAccounts)) {
      const pendingStr = await redisConnection.get(`pending_dms:${igAccountId}`);
      if (pendingStr) {
        const count = parseInt(pendingStr, 10);
        if (count > 0) activeQueues += count;
      }
    }

    let totalRevenue = 0;
    let todayRevenue = 0;
    let yesterdayRevenue = 0;
    const revenueHistorical: Record<string, number> = {};

    if (subdomain) {
      const subDoc = await db.collection('subdomains').doc(subdomain).get();
      if (subDoc.exists) {
        totalRevenue = subDoc.data()?.totalRevenue || 0;
        
        const revStatsSnap = await db.collection('subdomains').doc(subdomain).collection('revenue_stats').get();
        revStatsSnap.forEach(doc => {
          const data = doc.data();
          const date = data.date;
          if (date === today) todayRevenue = data.revenue || 0;
          if (date === yesterday) yesterdayRevenue = data.revenue || 0;
          revenueHistorical[date] = data.revenue || 0;
        });
      }
    }

    // Combine Historical Data for last 14 days
    const graphData = [];
    for (let i = 13; i >= 0; i--) {
      const dateStr = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      graphData.push({
        date: dateStr,
        views: viewsHistorical[dateStr] || 0,
        dms: dmHistorical[dateStr] || 0,
        revenue: revenueHistorical[dateStr] || 0
      });
    }

    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    res.json({
      summary: {
        totalDMs,
        todayDMs,
        dmsGrowth: calculateGrowth(todayDMs, yesterdayDMs),
        todayViews,
        viewsGrowth: calculateGrowth(todayViews, yesterdayViews),
        totalRevenue,
        todayRevenue,
        revenueGrowth: calculateGrowth(todayRevenue, yesterdayRevenue),
        activeQueues
      },
      graphData
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};
