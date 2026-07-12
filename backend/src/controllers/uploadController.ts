import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/firebase';
import sharp from 'sharp';
import { google } from 'googleapis';

// ---------------------------------------------------------
// Google Drive Setup
// ---------------------------------------------------------
const getDriveService = async () => {
  try {
    const metaSnap = await db.collection('platform_settings').doc('meta_config').get();
    if (!metaSnap.exists) return null;
    
    const { googleClientId, googleClientSecret, googleRefreshToken, googleDriveFolderLink } = metaSnap.data() || {};
    
    if (googleClientId && googleClientSecret && googleRefreshToken) {
      const oauth2Client = new google.auth.OAuth2(
        googleClientId,
        googleClientSecret,
        'https://google.com'
      );
      oauth2Client.setCredentials({ refresh_token: googleRefreshToken });
      return { 
        driveService: google.drive({ version: 'v3', auth: oauth2Client }), 
        driveLink: googleDriveFolderLink 
      };
    }
  } catch (error) {
    console.error('Failed to initialize Google Drive OAuth2:', error);
  }
  return null;
};

// ---------------------------------------------------------
// Multer Setup
// ---------------------------------------------------------
const storage = multer.memoryStorage();

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

// ---------------------------------------------------------
// Upload Handler
// ---------------------------------------------------------
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

    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${uuidv4()}.webp`;
    const fullPath = path.join(uploadDir, filename);
    const relativePath = `uploads/${filename}`;

    // Process and compress image using sharp
    await sharp(req.file.buffer)
      .resize(1280, null, { withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(fullPath);

    let driveFileId = null;

    // Async upload to Google Drive if configured
    try {
      const driveConfig = await getDriveService();
      if (driveConfig && driveConfig.driveLink) {
        const { driveService, driveLink } = driveConfig;
        
        // Extract folder ID from link (e.g. https://drive.google.com/drive/folders/1Ix7... )
        const match = driveLink.match(/\/folders\/([a-zA-Z0-9_-]+)/);
        const folderId = match ? match[1] : null;

        if (folderId) {
          const fileMetadata = {
            name: filename,
            parents: [folderId]
          };
          const media = {
            mimeType: 'image/webp',
            body: fs.createReadStream(fullPath)
          };
          const driveResponse = await driveService.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id'
          });
          driveFileId = driveResponse.data.id;
          console.log(`Backed up to Drive: ${driveFileId}`);
        }
      }
    } catch (driveErr) {
      console.error('Google Drive backup failed:', driveErr);
      // We don't throw, we just proceed since local upload succeeded
    }

    // Store in media collection
    const mediaDoc = {
      path: relativePath,
      type: 'image/webp',
      creatorId,
      driveFileId, // Store the Drive ID so we can delete it later
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('media').add(mediaDoc);

    res.json({
      id: docRef.id,
      path: relativePath,
      message: 'Image uploaded successfully'
    });
  } catch (error: any) {
    console.error('Image processing error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ---------------------------------------------------------
// Delete Handler
// ---------------------------------------------------------
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
    const data = doc.data();

    // Delete from filesystem
    const fullPath = path.join(__dirname, '../../', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Delete from Google Drive if backed up
    if (data.driveFileId) {
      try {
        const driveConfig = await getDriveService();
        if (driveConfig) {
          await driveConfig.driveService.files.delete({
            fileId: data.driveFileId
          });
          console.log(`Deleted backup from Drive: ${data.driveFileId}`);
        }
      } catch (driveErr) {
        console.error(`Failed to delete from Drive (${data.driveFileId}):`, driveErr);
        // Proceed anyway so we still delete it from the DB
      }
    }

    // Delete from DB
    await doc.ref.delete();

    res.json({ message: 'Image deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
