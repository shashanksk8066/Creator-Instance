import { Request, Response } from 'express';
import { db, auth as adminAuth } from '../config/firebase';
import { autoDmQueue } from '../workers/dmQueue';
import axios from 'axios';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import fs from 'fs';
import path from 'path';

export const getPendingUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only admins should access this (middleware should handle this, but let's double check)
    const snapshot = await db.collection('users').where('role', '==', 'creator').get();
    
    const users: any[] = [];
    snapshot.forEach(doc => {
      users.push({ uid: doc.id, ...doc.data() });
    });

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uid, action } = req.params; // action = 'approve' | 'reject'
    
    const actionStr = action as string;
    
    if (!['approve', 'reject', 'pending'].includes(actionStr)) {
      res.status(400).json({ error: 'Invalid action' });
      return;
    }

    const newStatus = actionStr === 'approve' ? 'Approved' : actionStr === 'reject' ? 'Rejected' : 'Pending';
    
    const userRef = db.collection('users').doc(uid as string);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userData = userDoc.data();
    
    // Update user status
    await userRef.update({ status: newStatus });
    
    // Update subdomain status if they have one
    if (userData?.subdomain) {
      await db.collection('subdomains').doc(userData.subdomain).update({
        status: newStatus
      });
    }

    res.json({ message: `User successfully ${newStatus}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const adminDeleteCreator = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uid } = req.params;
    if (!uid) {
      res.status(400).json({ error: 'UID is required' });
      return;
    }

    const userRef = db.collection('users').doc(uid as string);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    const userData = userDoc.data();
    
    // 1. Delete Subdomain document
    if (userData?.subdomain) {
      await db.collection('subdomains').doc(userData.subdomain).delete();
    }
    
    // 2. Delete all Blogs
    const blogsSnap = await db.collection('blogs').where('creatorId', '==', uid).get();
    const batch1 = db.batch();
    blogsSnap.forEach(doc => batch1.delete(doc.ref));
    await batch1.commit();
    
    // 3. Delete all Auto DM Rules
    const rulesSnap = await db.collection('auto_dm_rules').where('creatorId', '==', uid).get();
    const batch2 = db.batch();
    rulesSnap.forEach(doc => batch2.delete(doc.ref));
    await batch2.commit();
    
    // 4. Delete all Payouts
    const payoutsSnap = await db.collection('payouts').where('userId', '==', uid).get();
    const batch3 = db.batch();
    payoutsSnap.forEach(doc => batch3.delete(doc.ref));
    await batch3.commit();
    
    // 5. Delete all Support Tickets
    const ticketsSnap = await db.collection('support_tickets').where('userId', '==', uid).get();
    const batch4 = db.batch();
    ticketsSnap.forEach(doc => batch4.delete(doc.ref));
    await batch4.commit();
    
    // 6. Delete all DM Logs in chunks of 500
    const dmLogsSnap = await db.collection('auto_dm_logs').where('creatorId', '==', uid).get();
    const dmLogDocs = dmLogsSnap.docs;
    for (let i = 0; i < dmLogDocs.length; i += 500) {
      const chunk = dmLogDocs.slice(i, i + 500);
      const logBatch = db.batch();
      chunk.forEach(doc => logBatch.delete(doc.ref));
      await logBatch.commit();
    }
    
    // 7. Delete User from Firestore
    await userRef.delete();
    
    // 8. Delete User from Firebase Auth
    try {
      await adminAuth.deleteUser(uid as string);
    } catch (authError: any) {
      console.error(`Failed to delete auth user ${uid}:`, authError.message);
    }
    
    res.json({ message: 'User and all related data deleted successfully' });
  } catch (error: any) {
    console.error('Delete creator error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMetaSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const docRef = db.collection('platform_settings').doc('meta_config');
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      res.json({ appId: '', appSecret: '', webhookVerifyToken: '', oauthRedirectUri: '', adsterraApiKey: '' });
      return;
    }

    res.json(docSnap.data());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMetaSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { appId, appSecret, webhookVerifyToken, oauthRedirectUri, adsterraApiKey } = req.body;

    const docRef = db.collection('platform_settings').doc('meta_config');
    await docRef.set({
      appId: appId || '',
      appSecret: appSecret || '',
      webhookVerifyToken: webhookVerifyToken || '',
      oauthRedirectUri: oauthRedirectUri || '',
      adsterraApiKey: adsterraApiKey || '',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    res.json({ message: 'Meta settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const runAdsterraSync = async (): Promise<void> => {
  const logFile = path.join(__dirname, '../../test.log');
  const log = (msg: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const dataStr = data ? `\nData: ${JSON.stringify(data, null, 2)}` : '';
    const logMsg = `[${timestamp}] ${msg}${dataStr}\n`;
    fs.appendFileSync(logFile, logMsg);
  };

  try {
    log('--- STARTING ADSTERRA SYNC ---');
    const docRef = db.collection('platform_settings').doc('meta_config');
    const docSnap = await docRef.get();
    
    if (!docSnap.exists || !docSnap.data()?.adsterraApiKey) {
      log('ERROR: Adsterra API Key not configured');
      throw new Error('Adsterra API Key not configured in Meta Settings');
    }
    
    const apiKey = docSnap.data()!.adsterraApiKey;
    
    // 1. Fetch our approved subdomains
    log('1. Fetching approved subdomains from DB...');
    const subdomainsSnap = await db.collection('subdomains').where('status', '==', 'Approved').get();
    const approvedSubdomains = subdomainsSnap.docs.map(doc => doc.id);
    log('Approved Subdomains:', approvedSubdomains);
    
    // 2. Fetch domains mapping
    log('2. Fetching Adsterra domains list...');
    const domainsRes = await axios.get('https://api3.adsterratools.com/publisher/domains.json', {
      headers: { 'X-API-Key': apiKey }
    });
    
    const domainsData = domainsRes.data?.items || [];
    log('Adsterra domains response items count:', domainsData.length);
    log('Adsterra domains sample:', domainsData);
    
    // Map Adsterra domain ID to our exact subdomain string, filtering out non-matches
    const domainMap: Record<number, string> = {};
    const baseDomain = process.env.BASE_DOMAIN || 'localhost';
    
    domainsData.forEach((d: any) => {
      let title = d.title;
      let matchedSubdomain = '';
      
      // Try exact match or base domain extraction
      if (approvedSubdomains.includes(title)) {
        matchedSubdomain = title;
      } else {
        // Strip the base domain and check if it matches an approved subdomain
        const suffixesToTry = [`.${baseDomain}`, `.localhost.in`, `.localhost`];
        for (const suffix of suffixesToTry) {
          if (title.endsWith(suffix)) {
            const potentialSubdomain = title.replace(suffix, '');
            if (approvedSubdomains.includes(potentialSubdomain)) {
              matchedSubdomain = potentialSubdomain;
              break;
            }
          }
        }
      }
      
      if (matchedSubdomain) {
        domainMap[d.id] = matchedSubdomain;
      }
    });
    log('Filtered Domain Map (Adsterra ID -> Approved Subdomain):', domainMap);

    // 3. Fetch stats for the last 3 days
    const finishDate = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(subDays(new Date(), 3), 'yyyy-MM-dd');
    
    log(`3. Fetching Adsterra stats from ${startDate} to ${finishDate}...`);
    const statsRes = await axios.get(`https://api3.adsterratools.com/publisher/stats.json`, {
      params: {
        group_by: ['date', 'domain'],
        start_date: startDate,
        finish_date: finishDate
      },
      headers: { 'X-API-Key': apiKey }
    });
    
    const statsItems = statsRes.data?.items || [];
    log('Adsterra stats items count:', statsItems.length);
    log('Adsterra raw stats items:', statsItems);
    
    // 4. Group API results by domain string
    const updates: Record<string, any[]> = {};
    
    for (const item of statsItems) {
      // domainMap only contains IDs of approved subdomains
      const subdomain = domainMap[item.domain];
      if (!subdomain) continue;
      
      if (!updates[subdomain]) updates[subdomain] = [];
      updates[subdomain].push(item);
    }
    log('Grouped updates by subdomain:', updates);
    
    // 5. Process each subdomain and update Firestore
    log('4. Processing each subdomain and updating Firestore...');
    for (const subdomain of Object.keys(updates)) {
      log(`Processing subdomain: ${subdomain}`);
      const subRef = db.collection('subdomains').doc(subdomain);
      const subDoc = await subRef.get();
      
      let currentTotalRevenue = subDoc.data()?.totalRevenue || 0;
      let currentTotalClicks = subDoc.data()?.totalClicks || 0;
      let currentTotalImpressions = subDoc.data()?.totalImpressions || 0;
      
      let deltaRevenue = 0;
      let deltaClicks = 0;
      let deltaImpressions = 0;
      
      for (const stat of updates[subdomain]) {
        const dateStr = stat.date; 
        const rawRevenue = Number(stat.revenue || 0);
        const revenue50 = rawRevenue * 0.5; // Scaled by 50%
        const clicks = Number(stat.clicks || 0);
        const impressions = Number(stat.impression || 0);
        
        const dateRef = subRef.collection('revenue_stats').doc(dateStr);
        const dateDoc = await dateRef.get();
        
        const oldRevenue = dateDoc.exists ? (dateDoc.data()?.revenue || 0) : 0;
        const oldClicks = dateDoc.exists ? (dateDoc.data()?.clicks || 0) : 0;
        const oldImpressions = dateDoc.exists ? (dateDoc.data()?.impressions || 0) : 0;
        
        deltaRevenue += (revenue50 - oldRevenue);
        deltaClicks += (clicks - oldClicks);
        deltaImpressions += (impressions - oldImpressions);
        
        log(`- Date ${dateStr} for ${subdomain}: RawRev=${rawRevenue}, Rev50%=${revenue50}, OldRev=${oldRevenue}, DeltaRev=${revenue50 - oldRevenue}`);
        
        await dateRef.set({
          date: dateStr,
          revenue: revenue50,
          clicks,
          impressions,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      
      log(`Total Deltas for ${subdomain} - Rev: ${deltaRevenue}, Clicks: ${deltaClicks}, Imp: ${deltaImpressions}`);
      
      await subRef.set({
        totalRevenue: currentTotalRevenue + deltaRevenue,
        totalClicks: currentTotalClicks + deltaClicks,
        totalImpressions: currentTotalImpressions + deltaImpressions,
        lastRevenueSync: new Date().toISOString()
      }, { merge: true });
    }
    
    log('--- SYNC SUCCESSFUL ---\n');
    return;
  } catch (error: any) {
    log('--- SYNC FAILED WITH ERROR ---', error.response?.data || error.message);
    console.error('Adsterra sync error:', error.response?.data || error.message);
    throw error;
  }
};

export const syncAdsterraRevenue = async (req: Request, res: Response): Promise<void> => {
  try {
    await runAdsterraSync();
    res.json({ message: 'Revenue synced successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdsRevenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const subdomainsSnap = await db.collection('subdomains').get();
    const subdomains: any[] = [];
    
    for (const doc of subdomainsSnap.docs) {
      const data = doc.data();
      if (data.totalRevenue !== undefined || data.status) {
        subdomains.push({
          id: doc.id,
          ...data
        });
      }
    }
    
    res.json(subdomains);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdsRevenueByDomain = async (req: Request, res: Response): Promise<void> => {
  try {
    const subdomain = req.params.subdomain as string;
    const statsSnap = await db.collection('subdomains').doc(subdomain).collection('revenue_stats').orderBy('date', 'desc').get();
    
    const stats: any[] = [];
    statsSnap.forEach(doc => stats.push(doc.data()));
    
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllSupportTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('support_tickets').get();
    
    const tickets: any[] = [];
    snapshot.forEach(doc => tickets.push({ id: doc.id, ...doc.data() }));

    // Sort by createdAt desc
    tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSupportTicketStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, remarks } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const docRef = db.collection('support_tickets').doc(id as string);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    const updateData: any = { status };
    if (remarks !== undefined) {
      updateData.remarks = remarks;
    }

    await docRef.update(updateData);
    res.json({ message: 'Ticket updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, message, target, type } = req.body;
    if (!title || !message || !target) {
      res.status(400).json({ error: 'Title, message, and target are required' });
      return;
    }

    const notification = {
      title,
      message,
      target, // 'ALL' or userId
      type: type || 'info',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('notifications').add(notification);
    res.status(201).json({ id: docRef.id, ...notification });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdminNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('notifications').get();
    
    const notifications: any[] = [];
    snapshot.forEach(doc => notifications.push({ id: doc.id, ...doc.data() }));

    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllCreators = async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('users').get();
    
    // Fetch all ads to count per creator
    const adsSnap = await db.collection('advertisements').get();
    const adsCountMap: Record<string, number> = {};
    adsSnap.forEach(doc => {
      const creatorId = doc.data().creatorId;
      if (creatorId) {
        adsCountMap[creatorId] = (adsCountMap[creatorId] || 0) + 1;
      }
    });

    const creators: any[] = [];
    snapshot.forEach(doc => {
      creators.push({ 
        uid: doc.id, 
        adsCount: adsCountMap[doc.id] || 0,
        ...doc.data() 
      });
    });
    res.json(creators);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdminOverviewAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // 1. Total Platform Views
    const statsSnap = await db.collection('creator_daily_stats').get();
    let totalViews = 0;
    let todayViews = 0;
    let yesterdayViews = 0;
    const viewsHistorical: Record<string, number> = {};

    statsSnap.forEach(doc => {
      const data = doc.data();
      totalViews += data.pageViews || 0;
      if (data.date === today) todayViews += data.pageViews || 0;
      if (data.date === yesterday) yesterdayViews += data.pageViews || 0;
      viewsHistorical[data.date] = (viewsHistorical[data.date] || 0) + (data.pageViews || 0);
    });

    // 2. Total Successful DMs & Active Queues
    const dmsSnap = await db.collection('auto_dm_logs').get();
    let totalDMs = 0;
    let todayDMs = 0;
    let yesterdayDMs = 0;
    let activeQueues = (await autoDmQueue.getDelayedCount()) + (await autoDmQueue.getWaitingCount());
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

    // 3. Today/Yesterday/Historical Ad Revenue
    const revSnap = await db.collectionGroup('revenue_stats').get();
    let todayRev = 0;
    let yesterdayRev = 0;
    const revHistorical: Record<string, number> = {};

    revSnap.forEach(doc => {
      const data = doc.data();
      if (data.date === today) todayRev += data.revenue || 0;
      if (data.date === yesterday) yesterdayRev += data.revenue || 0;
      revHistorical[data.date] = (revHistorical[data.date] || 0) + (data.revenue || 0);
    });

    // 3.5 Total All-Time Revenue (from subdomains)
    const subdomainsSnap = await db.collection('subdomains').get();
    let totalRev = 0;
    subdomainsSnap.forEach(doc => {
      totalRev += doc.data().totalRevenue || 0;
    });

    // 4. Total Active Creators
    const creatorsSnap = await db.collection('users').where('status', '==', 'Approved').get();
    const totalCreators = creatorsSnap.size;

    let totalConnectedAccounts = 0;
    creatorsSnap.forEach(doc => {
      const data = doc.data();
      if (data.instagramAccounts) {
        totalConnectedAccounts += Object.keys(data.instagramAccounts).length;
      }
    });

    // Build Chart Data (Last 7 Days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      chartData.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: viewsHistorical[dateStr] || 0,
        revenue: Number((revHistorical[dateStr] || 0).toFixed(2)),
        dms: dmHistorical[dateStr] || 0
      });
    }

    res.json({
      metrics: {
        totalViews,
        todayViews,
        viewsGrowth: yesterdayViews > 0 ? ((todayViews - yesterdayViews) / yesterdayViews) * 100 : (todayViews > 0 ? 100 : 0),
        totalDMs,
        todayDMs,
        dmGrowth: yesterdayDMs > 0 ? ((todayDMs - yesterdayDMs) / yesterdayDMs) * 100 : (todayDMs > 0 ? 100 : 0),
        activeQueues,
        totalRevenue: Number(totalRev.toFixed(2)),
        todayRevenue: Number(todayRev.toFixed(2)),
        revenueGrowth: yesterdayRev > 0 ? ((todayRev - yesterdayRev) / yesterdayRev) * 100 : (todayRev > 0 ? 100 : 0),
        totalCreators,
        totalConnectedAccounts
      },
      chartData
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCreatorDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.params.uid as string;
    if (!uid) {
      res.status(400).json({ error: 'UID is required' });
      return;
    }

    // 1. User Profile Data
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: 'Creator not found' });
      return;
    }
    const profile = { uid: userDoc.id, ...userDoc.data() };
    const subdomain = userDoc.data()?.subdomain;

    // 2. Blog Stats
    let totalBlogs = 0;
    let totalBlogViews = 0;
    const blogsSnap = await db.collection('blogs').where('creatorId', '==', uid).get();
    totalBlogs = blogsSnap.size;
    blogsSnap.forEach(doc => {
      totalBlogViews += doc.data().views || 0;
    });

    // 3. Revenue Stats
    let revenueData = { totalRevenue: 0, totalWithdrawn: 0, availableBalance: 0 };
    if (subdomain) {
      const subDoc = await db.collection('subdomains').doc(subdomain).get();
      if (subDoc.exists) {
        const subData = subDoc.data();
        const totalRev = subData?.totalRevenue || 0;
        const paidRev = subData?.paidRevenue || 0;
        revenueData = {
          totalRevenue: totalRev,
          totalWithdrawn: paidRev,
          availableBalance: subData?.availableBalance || 0
        };
      }
    }

    // 4. DM Stats
    const today = new Date().toISOString().split('T')[0];
    let totalDMs = 0;
    let todayDMs = 0;
    const dmSnap = await db.collection('auto_dm_logs').where('creatorId', '==', uid).get();
    dmSnap.forEach(doc => {
      const data = doc.data();
      if (data.status === 'success') {
        totalDMs++;
        if (data.timestamp && data.timestamp.split('T')[0] === today) {
          todayDMs++;
        }
      }
    });

    // 5. Payout History
    const payoutsSnap = await db.collection('payouts')
      .where('userId', '==', uid)
      .get();
    
    const payouts: any[] = [];
    payoutsSnap.forEach(doc => {
      payouts.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort in JS to avoid composite index requirement
    payouts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      profile,
      blogStats: {
        totalBlogs,
        totalBlogViews
      },
      dmStats: {
        totalDMs,
        todayDMs
      },
      revenueData,
      payouts
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllPublishedBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const blogsSnap = await db.collection('blogs').where('status', '==', 'Published').get();
    const blogs: any[] = [];
    
    // We'll also fetch user data to attach subdomain/name if needed, or let frontend handle it.
    // Let's attach it here for convenience.
    const userDocs: Record<string, any> = {};
    
    for (const doc of blogsSnap.docs) {
      const data = doc.data();
      let authorName = 'Unknown';
      let subdomain = 'unknown';
      
      if (data.creatorId) {
        if (!userDocs[data.creatorId]) {
          const userDoc = await db.collection('users').doc(data.creatorId).get();
          if (userDoc.exists) {
            userDocs[data.creatorId] = userDoc.data();
          }
        }
        authorName = userDocs[data.creatorId]?.fullName || 'Unknown';
        subdomain = userDocs[data.creatorId]?.subdomain || 'unknown';
      }
      
      blogs.push({ 
        id: doc.id, 
        ...data,
        authorName,
        subdomain
      });
    }

    res.json(blogs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const reviewBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reviewed } = req.body;
    
    await db.collection('blogs').doc(id as string).update({
      adminReviewed: reviewed,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const adminDeleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // We just physically delete it (or soft delete if we preferred, but physical is cleaner for moderation)
    await db.collection('blogs').doc(id as string).delete();
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const runMonthlyRollover = async (): Promise<void> => {
  const logFile = path.join(__dirname, '../../test.log');
  const log = (msg: string) => {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
  };

  try {
    log('--- STARTING MONTHLY ROLLOVER ---');
    
    // Get the previous month's date bounds
    const now = new Date();
    // E.g., if now is July 1st, we want June.
    const lastMonth = subMonths(now, 1);
    const startOfLastMonthStr = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
    const endOfLastMonthStr = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
    
    log(`Rollover Period: ${startOfLastMonthStr} to ${endOfLastMonthStr}`);

    const rolloverKey = format(lastMonth, 'yyyy-MM');

    const subdomainsSnap = await db.collection('subdomains').where('status', '==', 'Approved').get();
    
    for (const doc of subdomainsSnap.docs) {
      const subdomain = doc.id;
      const data = doc.data();
      const currentAvailable = data.availableBalance || 0;
      
      // Idempotency check: Have we already processed this month for this subdomain?
      if (data.lastRolloverMonth === rolloverKey) {
        log(`Subdomain ${subdomain}: Rollover for ${rolloverKey} already processed. Skipping.`);
        continue;
      }
      
      // Fetch revenue stats for the last month
      const statsSnap = await doc.ref.collection('revenue_stats')
        .where('date', '>=', startOfLastMonthStr)
        .where('date', '<=', endOfLastMonthStr)
        .get();
        
      let lastMonthRevenue = 0;
      statsSnap.docs.forEach(statDoc => {
        lastMonthRevenue += Number(statDoc.data().revenue || 0);
      });
      
      const newBalance = currentAvailable + lastMonthRevenue;
      
      log(`Subdomain ${subdomain}: Accrued $${lastMonthRevenue.toFixed(4)}. New Balance: $${newBalance.toFixed(4)}`);
      
      await doc.ref.update({
        availableBalance: newBalance,
        lastRolloverMonth: rolloverKey
      });
    }
    
    log('--- MONTHLY ROLLOVER COMPLETE ---');
  } catch (error: any) {
    log(`[ERROR] Monthly Rollover Failed: ${error.message}`);
    console.error('Monthly Rollover Error:', error);
  }
};
