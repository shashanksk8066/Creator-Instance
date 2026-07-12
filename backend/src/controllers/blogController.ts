import { Request, Response } from 'express';
import { db } from '../config/firebase';

const generateSlug = async (title: string, creatorId: string, currentBlogId?: string): Promise<string> => {
  let baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  if (!baseSlug) baseSlug = 'blog';
  
  let slug = baseSlug;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const snapshot = await db.collection('blogs')
      .where('creatorId', '==', creatorId)
      .where('slug', '==', slug)
      .get();
      
    if (snapshot.empty) {
      isUnique = true;
    } else {
      // If the only document with this slug is the one we are editing, it's fine
      if (currentBlogId && snapshot.docs.length === 1 && snapshot.docs[0].id === currentBlogId) {
        isUnique = true;
      } else {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }
  }

  return slug;
};

export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.uid;
    const snapshot = await db.collection('blogs').where('creatorId', '==', creatorId).get();
    
    // In a real app, implement pagination and filtering here
    const blogs: any[] = [];
    snapshot.forEach(doc => {
      // Don't return soft deleted blogs unless specified
      if (doc.data().status !== 'Deleted') {
        blogs.push({ id: doc.id, ...doc.data() });
      }
    });

    // Sort descending
    blogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(blogs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.uid;
    const { id } = req.params;

    const doc = await db.collection('blogs').doc(id as string).get();
    
    if (!doc.exists || doc.data()?.creatorId !== creatorId) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.uid;
    if (!creatorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { 
      title = 'Untitled Blog', 
      content = '', 
      html = '',
      status = 'Draft', 
      categoryId = null, 
      tags = [], 
      featuredImage = null,
      seoTitle = '',
      seoDesc = '',
      customSlug
    } = req.body;

    const slug = await generateSlug(customSlug || title, creatorId);

    const blogData = {
      title,
      slug,
      content,
      html,
      status, // 'Draft', 'Published', 'Archived', 'Deleted'
      categoryId,
      tags,
      featuredImage,
      seoTitle,
      seoDesc,
      creatorId,
      adminReviewed: false,
      publishedAt: status === 'Published' ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('blogs').add(blogData);
    res.json({ id: docRef.id, ...blogData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.uid;
    const { id } = req.params;
    
    const docRef = db.collection('blogs').doc(id as string);
    const doc = await docRef.get();

    if (!doc.exists || doc.data()?.creatorId !== creatorId) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }

    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    
    // Check if title or custom slug changed to regenerate slug
    if (updates.title || updates.customSlug) {
       updates.slug = await generateSlug(updates.customSlug || updates.title || doc.data()?.title, creatorId as string, id as string);
    }
    
    // Reset admin review status if content is updated
    if (updates.title || updates.content || updates.status === 'Published') {
      updates.adminReviewed = false;
    }
    
    // If status changed to Published, record published date
    if (updates.status === 'Published' && doc.data()?.status !== 'Published') {
       updates.publishedAt = new Date().toISOString();
    }

    await docRef.update(updates);
    res.json({ id, ...doc.data(), ...updates });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.uid;
    const { id } = req.params;
    const { permanent } = req.query;

    const docRef = db.collection('blogs').doc(id as string);
    const doc = await docRef.get();

    if (!doc.exists || doc.data()?.creatorId !== creatorId) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }

    if (permanent === 'true') {
      await docRef.delete();
      res.json({ message: 'Blog permanently deleted' });
    } else {
      await docRef.update({ 
        status: 'Deleted',
        updatedAt: new Date().toISOString()
      });
      res.json({ message: 'Blog moved to trash' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
