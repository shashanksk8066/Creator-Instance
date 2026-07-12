import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.json(doc.data());
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getCreatorAdsRevenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const userData = userDoc.data();
    const subdomain = userData?.subdomain;

    if (!subdomain) {
      res.status(400).json({ error: 'No subdomain associated with this user' });
      return;
    }

    // Fetch total stats from subdomains doc
    const subDoc = await db.collection('subdomains').doc(subdomain).get();
    const subData = subDoc.data() || {};

    // Fetch daily stats
    const statsSnap = await db.collection('subdomains').doc(subdomain).collection('revenue_stats').orderBy('date', 'desc').get();
    const dailyStats: any[] = [];
    statsSnap.forEach(doc => dailyStats.push(doc.data()));

    res.json({
      subdomain,
      totalRevenue: subData.totalRevenue || 0,
      totalClicks: subData.totalClicks || 0,
      totalImpressions: subData.totalImpressions || 0,
      lastRevenueSync: subData.lastRevenueSync || null,
      dailyStats
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const createSupportTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { subject, message, type } = req.body;
    if (!subject || !message || !type) {
      res.status(400).json({ error: 'Subject, message, and type are required' });
      return;
    }

    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();

    const ticket = {
      creatorId: uid,
      creatorEmail: req.user?.email || userData?.email || 'Unknown',
      creatorName: userData?.fullName || 'Unknown',
      subject,
      message,
      type,
      status: 'Open',
      remarks: '',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('support_tickets').add(ticket);

    res.status(201).json({ id: docRef.id, ...ticket });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getCreatorSupportTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const snapshot = await db.collection('support_tickets')
      .where('creatorId', '==', uid)
      .get();

    const tickets: any[] = [];
    snapshot.forEach(doc => tickets.push({ id: doc.id, ...doc.data() }));

    // Sort by createdAt desc in memory
    tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getUserNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get notifications targeted to ALL or to this specific user
    const notificationsSnap = await db.collection('notifications').get();
    
    // Get reads for this user
    const readsSnap = await db.collection('notification_reads')
      .where('userId', '==', uid)
      .get();
      
    const readIds = new Set<string>();
    readsSnap.forEach(doc => readIds.add(doc.data().notificationId));

    const notifications: any[] = [];
    notificationsSnap.forEach(doc => {
      const data = doc.data();
      if ((data.target === 'ALL' || data.target === uid) && !readIds.has(doc.id)) {
        notifications.push({ id: doc.id, ...data });
      }
    });

    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markNotificationRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const { id } = req.params;
    
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await db.collection('notification_reads').add({
      userId: uid,
      notificationId: id,
      readAt: new Date().toISOString()
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const setupPayoutDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { payoutDetails } = req.body;
    if (!payoutDetails || !payoutDetails.type) {
      res.status(400).json({ error: 'Invalid payout details' });
      return;
    }

    // Find the subdomain for this creator
    const subdomainsSnap = await db.collection('subdomains').where('creatorId', '==', uid).get();
    if (subdomainsSnap.empty) {
      res.status(404).json({ error: 'Subdomain not found for this creator' });
      return;
    }

    const subdomainDoc = subdomainsSnap.docs[0];
    await subdomainDoc.ref.update({
      payoutDetails: payoutDetails
    });

    res.json({ message: 'Payout details updated successfully', payoutDetails });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
