import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { redisConnection } from '../config/redis';

const CACHE_TTL = 3600; // 1 hour in seconds

// Helper to invalidate cache
const invalidateAdCache = async (creatorId: string) => {
  try {
    await redisConnection.del(`ads:${creatorId}`);
  } catch (error) {
    console.error('Redis cache invalidation error:', error);
  }
};

// ==========================================
// ADMIN ROUTES (Guarded by requireAdmin)
// ==========================================

export const getAdminAds = async (req: Request, res: Response): Promise<void> => {
  try {
    const { creatorId } = req.query;
    if (!creatorId) {
      res.status(400).json({ error: 'creatorId is required' });
      return;
    }

    const snapshot = await db.collection('advertisements')
      .where('creatorId', '==', creatorId as string)
      .get();
      
    const ads: any[] = [];
    snapshot.forEach(doc => ads.push({ id: doc.id, ...doc.data() }));

    // Sort by priority ASC
    ads.sort((a, b) => (a.priority || 1) - (b.priority || 1));

    res.json(ads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const { creatorId, provider, name, placement, priority = 1, desktop = true, mobile = true, enabled = true, code } = req.body;

    if (!creatorId || !provider || !name || !placement || !code) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    let processedCode = code.trim();
    if (placement === 'CTA_BUTTON') {
      const hrefMatch = processedCode.match(/href=["']([^"']+)["']/i);
      if (hrefMatch) processedCode = hrefMatch[1];
      
      if (!processedCode.startsWith('http://') && !processedCode.startsWith('https://')) {
        processedCode = 'https://' + processedCode;
      }
    }

    const newAd = {
      creatorId,
      provider,
      name,
      placement,
      priority: Number(priority),
      desktop: Boolean(desktop),
      mobile: Boolean(mobile),
      enabled: Boolean(enabled),
      code: processedCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('advertisements').add(newAd);
    await invalidateAdCache(creatorId);

    res.status(201).json({ id: docRef.id, ...newAd });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { creatorId, provider, name, placement, priority, desktop, mobile, enabled, code } = req.body;

    if (!creatorId) {
      res.status(400).json({ error: 'creatorId is required for cache invalidation' });
      return;
    }

    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (provider !== undefined) updateData.provider = provider;
    if (name !== undefined) updateData.name = name;
    if (placement !== undefined) updateData.placement = placement;
    if (priority !== undefined) updateData.priority = Number(priority);
    if (desktop !== undefined) updateData.desktop = Boolean(desktop);
    if (mobile !== undefined) updateData.mobile = Boolean(mobile);
    if (enabled !== undefined) updateData.enabled = Boolean(enabled);
    if (code !== undefined) {
      let processedCode = code.trim();
      // Use existing placement if placement isn't being updated
      const currentPlacement = placement !== undefined ? placement : (await db.collection('advertisements').doc(id as string).get()).data()?.placement;
      
      if (currentPlacement === 'CTA_BUTTON') {
        const hrefMatch = processedCode.match(/href=["']([^"']+)["']/i);
        if (hrefMatch) processedCode = hrefMatch[1];
        
        if (!processedCode.startsWith('http://') && !processedCode.startsWith('https://')) {
          processedCode = 'https://' + processedCode;
        }
      }
      updateData.code = processedCode;
    }

    await db.collection('advertisements').doc(id as string).update(updateData);
    await invalidateAdCache(creatorId as string);

    res.json({ id, ...updateData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { creatorId } = req.query;

    if (!creatorId) {
      res.status(400).json({ error: 'creatorId query parameter is required for cache invalidation' });
      return;
    }

    await db.collection('advertisements').doc(id as string).delete();
    await invalidateAdCache(creatorId as string);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// PUBLIC ROUTE (Guarded by tenantMiddleware)
// ==========================================

export const getPublicAds = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.tenant?.creatorId;
    if (!creatorId) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    const cacheKey = `ads:${creatorId}`;
    try {
      const cached = await redisConnection.get(cacheKey);
      if (cached) {
        res.json(JSON.parse(cached));
        return;
      }
    } catch (cacheErr) {
      console.error('Redis cache get error:', cacheErr);
      // Continue to DB if cache fails
    }

    const snapshot = await db.collection('advertisements')
      .where('creatorId', '==', creatorId)
      .where('enabled', '==', true)
      .get();
      
    const ads: any[] = [];
    snapshot.forEach(doc => ads.push({ id: doc.id, ...doc.data() }));

    // Sort by priority ASC
    ads.sort((a, b) => (a.priority || 1) - (b.priority || 1));

    try {
      await redisConnection.setex(cacheKey, CACHE_TTL, JSON.stringify(ads));
    } catch (cacheErr) {
      console.error('Redis cache set error:', cacheErr);
    }

    res.json(ads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
