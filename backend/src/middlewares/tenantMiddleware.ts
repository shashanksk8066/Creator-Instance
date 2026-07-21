import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase';
import { getCache, setCache } from '../services/cacheService';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      tenant?: any; // You can type this properly with a Tenant interface
    }
  }
}

export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const host = req.headers.host || '';
    
    // For local development, assuming format like: tenant.localhost:3000
    // In production: tenant.domain.com
    const hostname = host.split(':')[0];
    
    // Use environment variable for base domain, default to localhost
    const baseDomain = process.env.BASE_DOMAIN || 'localhost';
    
    if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
      return next();
    }
    
    // Extract subdomain assuming format: subdomain.baseDomain
    let subdomain = '';
    if (hostname.endsWith(`.${baseDomain}`)) {
      subdomain = hostname.replace(`.${baseDomain}`, '');
    } else {
      // Fallback for other scenarios
      const parts = hostname.split('.');
      if (parts.length === 1 && parts[0] === 'localhost') {
        return next();
      }
      if (parts.length === 2 && parts[1] !== 'localhost') {
        return next();
      }
      subdomain = parts[0];
    }
    
    // 1. Check Cache
    const cachedTenant = await getCache(`tenant:${subdomain}`);
    if (cachedTenant) {
      console.log(`[REDIS CACHE HIT] Loaded tenant data for ${subdomain} from Redis.`);
      req.tenant = JSON.parse(cachedTenant);
      return next();
    }
    
    console.log(`[REDIS CACHE MISS] Fetching tenant data for ${subdomain} from Firebase Firestore.`);
    // 2. Fallback to Firestore
    const subdomainsRef = db.collection('subdomains').doc(subdomain);
    const doc = await subdomainsRef.get();
    
    if (!doc.exists) {
       res.status(404).json({ error: 'Tenant not found' });
       return;
    }
    
    const tenantData = doc.data();
    
    // Check if approved
    if (tenantData?.status !== 'Approved') {
       res.status(403).json({ error: 'Tenant pending approval or blocked' });
       return;
    }
    
    // Attach to request
    req.tenant = tenantData;
    
    // 3. Cache it
    await setCache(`tenant:${subdomain}`, JSON.stringify(tenantData), 3600); // 1 hour
    
    next();
  } catch (error) {
    console.error('Tenant middleware error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
