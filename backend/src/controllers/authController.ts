import { Request, Response } from 'express';
import { db, auth } from '../config/firebase';

export const registerCreator = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      password,
      socialPageLink,
      followersCount,
      creatorCategory,
      country,
      requestedSubdomain
    } = req.body;

    // 1. Basic Validation
    if (!email || !password || !requestedSubdomain) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // 2. Check Subdomain Availability
    const subdomainRef = db.collection('subdomains').doc(requestedSubdomain.toLowerCase());
    const subdomainDoc = await subdomainRef.get();
    
    if (subdomainDoc.exists) {
      res.status(409).json({ error: 'Subdomain already taken' });
      return;
    }

    // 3. Create Firebase Auth User
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName
    });

    // 4. Save Creator Profile in Firestore
    const creatorData = {
      uid: userRecord.uid,
      fullName,
      email,
      mobileNumber,
      socialPageLink,
      followersCount,
      creatorCategory,
      country,
      status: 'Approved',
      role: 'creator',
      createdAt: new Date().toISOString(),
      subdomain: requestedSubdomain.toLowerCase()
    };

    await db.collection('users').doc(userRecord.uid).set(creatorData);

    // 5. Reserve Subdomain
    await subdomainRef.set({
      creatorId: userRecord.uid,
      status: 'Approved',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ message: 'Creator registered and approved successfully.', creator: creatorData });
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const checkSubdomain = async (req: Request, res: Response): Promise<void> => {
    try {
        const { subdomain } = req.params;
        if (!subdomain) {
            res.status(400).json({ error: 'Subdomain is required' });
            return;
        }

        const doc = await db.collection('subdomains').doc((subdomain as string).toLowerCase()).get();
        if (doc.exists) {
            res.json({ available: false });
        } else {
            res.json({ available: true });
        }
    } catch(error: any) {
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}

export const checkUserExists = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    
    try {
      await auth.getUserByEmail(email);
      res.json({ exists: true });
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        res.json({ exists: false });
      } else {
        throw err;
      }
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
