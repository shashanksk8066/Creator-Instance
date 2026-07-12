import { Request, Response } from 'express';
import { db } from '../config/firebase';
import * as FirebaseFirestore from 'firebase-admin/firestore';
import { redisConnection } from '../config/redis';

const CACHE_TTL = 60; // 60 seconds

// Helper to fetch creator's data
const getCreatorId = (req: Request) => {
  return req.tenant?.creatorId;
};

export const getPublicCreatorInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = getCreatorId(req);
    if (!creatorId) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    const cacheKey = `cache:public:creator:${creatorId}`;
    const cachedData = await redisConnection.get(cacheKey);
    if (cachedData) {
      res.json(JSON.parse(cachedData));
      return;
    }

    const doc = await db.collection('users').doc(creatorId).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Creator not found' });
      return;
    }

    const data = doc.data();
    const responseData = {
      fullName: data?.fullName,
      email: data?.email,
      subdomain: data?.subdomain,
      about: data?.about || '',
      socialLinks: data?.socialLinks || {},
      contactEmail: data?.contactEmail || ''
    };

    await redisConnection.set(cacheKey, JSON.stringify(responseData), 'EX', CACHE_TTL);
    res.json(responseData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPublicBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = getCreatorId(req);
    if (!creatorId) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    const { limit = '10', category, q } = req.query;
    
    const cacheKey = `cache:public:blogs:${creatorId}:${category || 'all'}:${q || 'none'}:${limit}`;
    const cachedData = await redisConnection.get(cacheKey);
    if (cachedData) {
      res.json(JSON.parse(cachedData));
      return;
    }

    let query = db.collection('blogs')
      .where('creatorId', '==', creatorId)
      .where('status', '==', 'Published');
      
    if (category) {
      query = query.where('categoryId', '==', category);
    }
    
    const snapshot = await query.get();
    
    let blogs: any[] = [];
    snapshot.forEach(doc => blogs.push({ id: doc.id, ...doc.data() }));

    if (q && typeof q === 'string') {
      const searchLower = q.toLowerCase();
      blogs = blogs.filter(b => b.title?.toLowerCase().includes(searchLower) || b.content?.toLowerCase().includes(searchLower));
    }

    // Sort descending by publish date
    blogs.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const responseData = blogs.slice(0, parseInt(limit as string));
    await redisConnection.set(cacheKey, JSON.stringify(responseData), 'EX', CACHE_TTL);
    res.json(responseData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

import { auth } from '../config/firebase';

export const getPublicBlogBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = getCreatorId(req);
    const { slug } = req.params;

    if (!creatorId) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    // Optional auth check for previewing drafts
    let isOwner = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        if (decodedToken.uid === creatorId) {
          isOwner = true;
        }
      } catch (e) {
        // Ignore invalid tokens, just fall back to public view
      }
    }

    const cacheKey = `cache:public:blog:${creatorId}:${slug}`;
    
    // Only use cache if not the owner
    if (!isOwner) {
      const cachedData = await redisConnection.get(cacheKey);
      if (cachedData) {
        const blogData = JSON.parse(cachedData);
        // Fire-and-forget view buffering
        redisConnection.incr(`views:blog:${blogData.id}:${creatorId}`).catch(console.error);
        res.json(blogData);
        return;
      }
    }

    let query = db.collection('blogs')
      .where('creatorId', '==', creatorId)
      .where('slug', '==', slug)
      .limit(1);

    if (!isOwner) {
      query = query.where('status', '==', 'Published');
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }

    const doc = snapshot.docs[0];
    const responseData = { id: doc.id, ...doc.data() };
    
    if (!isOwner) {
      // Fire-and-forget view buffering instead of direct Firestore write
      redisConnection.incr(`views:blog:${doc.id}:${creatorId}`).catch(console.error);
      await redisConnection.set(cacheKey, JSON.stringify(responseData), 'EX', CACHE_TTL);
    }

    res.json(responseData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPublicCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = getCreatorId(req);
    if (!creatorId) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    const snapshot = await db.collection('categories').where('creatorId', '==', creatorId).get();
    
    const categories: any[] = [];
    snapshot.forEach(doc => categories.push({ id: doc.id, ...doc.data() }));

    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPublicTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = getCreatorId(req);
    if (!creatorId) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    const snapshot = await db.collection('tags').where('creatorId', '==', creatorId).get();
    
    const tags: any[] = [];
    snapshot.forEach(doc => tags.push({ id: doc.id, ...doc.data() }));

    res.json(tags);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
