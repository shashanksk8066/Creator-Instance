import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

try {
  const serviceAccount = require(path.resolve(__dirname, '../../serviceAccountKey.json'));

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully.');
  }
} catch (error) {
  console.error('Firebase Admin initialization error', error);
}

// When no arguments are passed, it automatically uses the default app initialized above
export const db = getFirestore();
export const auth = getAuth();
