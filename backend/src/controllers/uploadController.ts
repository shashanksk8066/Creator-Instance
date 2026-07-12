import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/firebase';

// Setup storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  }
});

// Configure multer
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed.'));
    }
  }
});

export const uploadMiddleware = upload.single('image');

export const handleImageUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }

    const creatorId = req.user?.uid;
    if (!creatorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const relativePath = `uploads/${req.file.filename}`;

    // Store in media collection
    const mediaDoc = {
      path: relativePath,
      type: req.file.mimetype,
      creatorId,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('media').add(mediaDoc);

    res.json({
      id: docRef.id,
      path: relativePath,
      message: 'Image uploaded successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleImageDelete = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.uid;
    const { path: imagePath } = req.body;

    if (!creatorId || !imagePath) {
      res.status(400).json({ error: 'Missing path or unauthorized' });
      return;
    }

    // Verify ownership
    const snapshot = await db.collection('media')
      .where('path', '==', imagePath)
      .where('creatorId', '==', creatorId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      res.status(404).json({ error: 'Media not found or unauthorized' });
      return;
    }

    const doc = snapshot.docs[0];

    // Delete from filesystem
    const fullPath = path.join(__dirname, '../../', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Delete from DB
    await doc.ref.delete();

    res.json({ message: 'Image deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
