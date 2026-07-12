import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export const getCreatorPayoutInfo = async (req: Request, res: Response): Promise<void> => {
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

    const subdomain = userDoc.data()?.subdomain;
    if (!subdomain) {
      res.status(400).json({ error: 'No subdomain associated with this user' });
      return;
    }

    // Fetch subdomain document
    const subDoc = await db.collection('subdomains').doc(subdomain).get();
    const subData = subDoc.data() || {};

    const availableBalance = subData.availableBalance || 0;
    const paidRevenue = subData.paidRevenue || 0;
    const payoutDetails = subData.payoutDetails || null;

    // Calculate this month's revenue
    const now = new Date();
    const startOfThisMonth = format(startOfMonth(now), 'yyyy-MM-dd');
    const endOfThisMonth = format(endOfMonth(now), 'yyyy-MM-dd');
    
    const thisMonthStats = await db.collection('subdomains').doc(subdomain)
      .collection('revenue_stats')
      .where('date', '>=', startOfThisMonth)
      .where('date', '<=', endOfThisMonth)
      .get();
      
    let thisMonthRevenue = 0;
    thisMonthStats.docs.forEach(doc => {
      thisMonthRevenue += Number(doc.data().revenue || 0);
    });

    // Calculate last month's revenue
    const lastMonth = subMonths(now, 1);
    const startOfLastMonth = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
    const endOfLastMonth = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
    
    const lastMonthStats = await db.collection('subdomains').doc(subdomain)
      .collection('revenue_stats')
      .where('date', '>=', startOfLastMonth)
      .where('date', '<=', endOfLastMonth)
      .get();
      
    let lastMonthRevenue = 0;
    lastMonthStats.docs.forEach(doc => {
      lastMonthRevenue += Number(doc.data().revenue || 0);
    });

    // Fetch payout history
    const payoutsSnap = await db.collection('payouts')
      .where('subdomain', '==', subdomain)
      .get();
      
    const payouts: any[] = [];
    payoutsSnap.forEach(doc => payouts.push({ id: doc.id, ...doc.data() }));
    payouts.sort((a, b) => new Date(b.paidAt || b.createdAt || 0).getTime() - new Date(a.paidAt || a.createdAt || 0).getTime());

    res.json({
      subdomain,
      availableBalance,
      paidRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      payoutDetails,
      payouts
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const setupPayoutDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const { payoutDetails } = req.body;
    
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const userDoc = await db.collection('users').doc(uid).get();
    const subdomain = userDoc.data()?.subdomain;
    
    if (!subdomain) {
      res.status(400).json({ error: 'No subdomain associated' });
      return;
    }

    await db.collection('subdomains').doc(subdomain).set({
      payoutDetails
    }, { merge: true });

    res.json({ message: 'Payout details updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getAdminPayouts = async (req: Request, res: Response): Promise<void> => {
  try {
    // Admin needs to see all approved subdomains with their balances
    const subdomainsSnap = await db.collection('subdomains').where('status', '==', 'Approved').get();
    
    const subdomains = subdomainsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        subdomain: doc.id,
        creatorId: data.creatorId,
        availableBalance: data.availableBalance || 0,
        paidRevenue: data.paidRevenue || 0,
        payoutDetails: data.payoutDetails || null
      };
    });

    res.json(subdomains);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const executePayout = async (req: Request, res: Response): Promise<void> => {
  try {
    const subdomain = req.params.subdomain as string;
    const { amount, remarks } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Valid amount is required' });
      return;
    }

    const subRef = db.collection('subdomains').doc(subdomain);
    const subDoc = await subRef.get();

    if (!subDoc.exists) {
      res.status(404).json({ error: 'Subdomain not found' });
      return;
    }

    const subData = subDoc.data()!;
    const availableBalance = subData.availableBalance || 0;
    const paidRevenue = subData.paidRevenue || 0;

    if (amount > availableBalance) {
      res.status(400).json({ error: 'Amount exceeds available balance' });
      return;
    }

    // Deduct from available balance, add to paid revenue
    const newAvailableBalance = availableBalance - amount;
    const newPaidRevenue = paidRevenue + amount;

    await subRef.set({
      availableBalance: newAvailableBalance,
      paidRevenue: newPaidRevenue
    }, { merge: true });

    // Record the transaction
    await db.collection('payouts').add({
      subdomain,
      amount,
      remarks: remarks || '',
      paidAt: new Date().toISOString()
    });

    res.json({ message: 'Payout marked as paid successfully', newAvailableBalance, newPaidRevenue });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
