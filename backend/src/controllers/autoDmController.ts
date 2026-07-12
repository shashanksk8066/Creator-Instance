import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { containsUrl } from '../utils/urlValidator';

export const createRule = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.uid;
    if (!creatorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { accountId, selectedPosts, triggerType, keywords, greeting, body, ctaText, blogId, publicReply } = req.body;

    // Strict URL Validation for all message fields
    if (containsUrl(greeting) || containsUrl(body) || (publicReply && containsUrl(publicReply))) {
      res.status(400).json({ error: 'Links are not allowed inside the message. Please use the CTA Button below to attach a blog link.' });
      return;
    }

    // Server-side validation
    if (!accountId) {
      res.status(400).json({ error: 'Must select an Instagram account' });
      return;
    }

    if (!selectedPosts || selectedPosts.length === 0) {
      res.status(400).json({ error: 'Must select at least one post' });
      return;
    }

    if (triggerType === 'keyword' && (!keywords || keywords.length === 0)) {
      res.status(400).json({ error: 'Must provide at least one keyword' });
      return;
    }

    if (!blogId) {
      res.status(400).json({ error: 'Must select a blog to link' });
      return;
    }

    // Verify blog belongs to creator and is published
    const blogDoc = await db.collection('blogs').doc(blogId).get();
    if (!blogDoc.exists || blogDoc.data()?.creatorId !== creatorId || blogDoc.data()?.status !== 'Published') {
      res.status(403).json({ error: 'Invalid or unpublished blog selected' });
      return;
    }

    const ruleData = {
      creatorId,
      accountId,
      selectedPosts,
      triggerType,
      keywords: triggerType === 'keyword' ? keywords.map((k: string) => k.toLowerCase().trim()) : [],
      greeting: greeting || '',
      body: body || '',
      ctaText: ctaText || 'Read More',
      blogId,
      publicReply: publicReply || null,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('auto_dm_rules').add(ruleData);
    res.json({ id: docRef.id, ...ruleData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRules = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.uid;
    if (!creatorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const snapshot = await db.collection('auto_dm_rules').where('creatorId', '==', creatorId).get();
    
    const rules: any[] = [];
    snapshot.forEach(doc => rules.push({ id: doc.id, ...doc.data() }));

    res.json(rules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRule = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.uid;
    const { id } = req.params;
    
    if (!creatorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const docRef = db.collection('auto_dm_rules').doc(id as string);
    const doc = await docRef.get();

    if (!doc.exists || doc.data()?.creatorId !== creatorId) {
      res.status(404).json({ error: 'Rule not found' });
      return;
    }

    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    
    // Strict URL Validation for all message fields
    if (containsUrl(updateData.greeting) || containsUrl(updateData.body) || (updateData.publicReply && containsUrl(updateData.publicReply))) {
      res.status(400).json({ error: 'Links are not allowed inside the message. Please use the CTA Button below to attach a blog link.' });
      return;
    }

    // Normalize keywords if changing to keyword trigger
    if (updateData.triggerType === 'keyword' && updateData.keywords) {
        updateData.keywords = updateData.keywords.map((k: string) => k.toLowerCase().trim());
    }

    await docRef.update(updateData);
    res.json({ message: 'Rule updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRule = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.uid;
    const { id } = req.params;
    
    if (!creatorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const docRef = db.collection('auto_dm_rules').doc(id as string);
    const doc = await docRef.get();

    if (!doc.exists || doc.data()?.creatorId !== creatorId) {
      res.status(404).json({ error: 'Rule not found' });
      return;
    }

    await docRef.delete();
    res.json({ message: 'Rule deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
