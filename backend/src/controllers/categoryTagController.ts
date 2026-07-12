import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.uid;
    const snapshot = await db.collection('categories').where('creatorId', '==', creatorId).get();
    
    const categories: any[] = [];
    snapshot.forEach(doc => categories.push({ id: doc.id, ...doc.data() }));

    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.uid;
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }

    const docRef = await db.collection('categories').add({
      name,
      creatorId,
      createdAt: new Date().toISOString()
    });

    res.json({ id: docRef.id, name, creatorId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.uid;
    const { id } = req.params;

    const docRef = db.collection('categories').doc(id as string);
    const doc = await docRef.get();

    if (!doc.exists || doc.data()?.creatorId !== creatorId) {
      res.status(404).json({ error: 'Category not found or unauthorized' });
      return;
    }

    await docRef.delete();
    res.json({ message: 'Category deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.uid;
    const snapshot = await db.collection('tags').where('creatorId', '==', creatorId).get();
    
    const tags: any[] = [];
    snapshot.forEach(doc => tags.push({ id: doc.id, ...doc.data() }));

    res.json(tags);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.uid;
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Tag name is required' });
      return;
    }

    const docRef = await db.collection('tags').add({
      name,
      creatorId,
      createdAt: new Date().toISOString()
    });

    res.json({ id: docRef.id, name, creatorId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.uid;
    const { id } = req.params;

    const docRef = db.collection('tags').doc(id as string);
    const doc = await docRef.get();

    if (!doc.exists || doc.data()?.creatorId !== creatorId) {
      res.status(404).json({ error: 'Tag not found or unauthorized' });
      return;
    }

    await docRef.delete();
    res.json({ message: 'Tag deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
