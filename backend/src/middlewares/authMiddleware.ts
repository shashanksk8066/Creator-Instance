import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../config/firebase';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const verifyAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    // Attach the verified user payload to the request
    req.user = decodedToken;
    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists || doc.data()?.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }
    
    next();
  } catch (error: any) {
    console.error('requireAdmin middleware error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const requireCreator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists || doc.data()?.role === 'admin') {
      // Reject admins from creator routes, or any user that isn't explicitly a creator
      res.status(403).json({ error: 'Forbidden: Creator access required' });
      return;
    }
    
    next();
  } catch (error: any) {
    console.error('requireCreator middleware error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
