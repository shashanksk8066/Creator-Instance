import express from 'express';
import { initCronJobs } from './cron';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyAuth, requireAdmin, requireCreator } from './middlewares/authMiddleware';
import { tenantMiddleware } from './middlewares/tenantMiddleware';
import { registerCreator, checkSubdomain, checkUserExists } from './controllers/authController';
import { getProfile, getCreatorAdsRevenue, createSupportTicket, getCreatorSupportTickets, getUserNotifications, markNotificationRead } from './controllers/userController';
import { 
  getPendingUsers, 
  updateApplicationStatus, 
  getMetaSettings, 
  updateMetaSettings, 
  syncAdsterraRevenue, 
  getAdsRevenue, 
  getAdsRevenueByDomain,
  getAllSupportTickets,
  updateSupportTicketStatus,
  createNotification,
  getAdminNotifications,
  getAllCreators,
  getAdminOverviewAnalytics,
  getCreatorDetails,
  getAllPublishedBlogs,
  reviewBlog,
  adminDeleteBlog,
  adminDeleteCreator,
  triggerManualRollover
} from './controllers/adminController';
import { uploadMiddleware, handleImageUpload, handleImageDelete } from './controllers/uploadController';
import { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from './controllers/blogController';
import { getCategories, createCategory, deleteCategory, getTags, createTag, deleteTag } from './controllers/categoryTagController';
import { getDashboardAnalytics } from './controllers/analyticsController';
import { getCreatorPayoutInfo, setupPayoutDetails, getAdminPayouts, executePayout } from './controllers/payoutController';
import { getPublicCreatorInfo, getPublicBlogs, getPublicBlogBySlug, getPublicCategories, getPublicTags } from './controllers/publicController';
import { generateAuthUrl, handleCallback, getMedia, disconnectAccount, getAccounts } from './controllers/instagramController';
import { createRule, getRules, updateRule, deleteRule } from './controllers/autoDmController';
import { getAdminAds, createAd, updateAd, deleteAd, getPublicAds } from './controllers/adController';
import { verifyWebhook, handleWebhook } from './controllers/webhookController';
import path from 'path';

// Initialize BullMQ Workers
import './workers/dmQueue';
import './workers/evaluationQueue';
import { startViewSyncWorker } from './workers/viewSyncWorker';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Main Platform Routes (No Tenant Required)
app.post('/api/auth/register', registerCreator);
app.post('/api/auth/check-user', checkUserExists);
app.get('/api/auth/check-subdomain/:subdomain', checkSubdomain);

app.get('/api/me', verifyAuth, getProfile);
app.get('/api/dashboard/revenue', verifyAuth, requireCreator, getCreatorAdsRevenue);
app.get('/api/dashboard/payouts', verifyAuth, requireCreator, getCreatorPayoutInfo);
app.post('/api/dashboard/payout-setup', verifyAuth, requireCreator, setupPayoutDetails);
app.get('/api/dashboard/analytics', verifyAuth, requireCreator, getDashboardAnalytics);
app.post('/api/dashboard/support', verifyAuth, requireCreator, createSupportTicket);
app.get('/api/dashboard/support', verifyAuth, requireCreator, getCreatorSupportTickets);
app.get('/api/dashboard/notifications', verifyAuth, requireCreator, getUserNotifications);
app.post('/api/dashboard/notifications/:id/read', verifyAuth, requireCreator, markNotificationRead);

// Webhook Routes (Public, Meta hits these)
app.get('/api/webhook', verifyWebhook);
app.post('/api/webhook', handleWebhook);

// Admin Routes
app.get('/api/admin/analytics/overview', verifyAuth, requireAdmin, getAdminOverviewAnalytics);
app.get('/api/admin/creators/all', verifyAuth, requireAdmin, getAllCreators);
app.get('/api/admin/creators/:uid/details', verifyAuth, requireAdmin, getCreatorDetails);
app.get('/api/admin/creators', verifyAuth, requireAdmin, getPendingUsers);
app.post('/api/admin/creators/:uid/:action', verifyAuth, requireAdmin, updateApplicationStatus);
app.get('/api/admin/settings/meta', verifyAuth, requireAdmin, getMetaSettings);
app.put('/api/admin/settings/meta', verifyAuth, requireAdmin, updateMetaSettings);
app.get('/api/admin/blogs', verifyAuth, requireAdmin, getAllPublishedBlogs);
app.post('/api/admin/blogs/:id/review', verifyAuth, requireAdmin, reviewBlog);
app.delete('/api/admin/blogs/:id', verifyAuth, requireAdmin, adminDeleteBlog);

app.delete('/api/admin/creators/:uid', verifyAuth, requireAdmin, adminDeleteCreator);

app.post('/api/admin/ads/revenue/sync', verifyAuth, requireAdmin, syncAdsterraRevenue);
app.get('/api/admin/ads/revenue', verifyAuth, requireAdmin, getAdsRevenue);
app.get('/api/admin/ads/revenue/:subdomain', verifyAuth, requireAdmin, getAdsRevenueByDomain);

app.get('/api/admin/ads', verifyAuth, requireAdmin, getAdminAds);
app.post('/api/admin/ads', verifyAuth, requireAdmin, createAd);
app.put('/api/admin/ads/:id', verifyAuth, requireAdmin, updateAd);
app.delete('/api/admin/ads/:id', verifyAuth, requireAdmin, deleteAd);

app.get('/api/admin/payouts', verifyAuth, requireAdmin, getAdminPayouts);
app.post('/api/admin/payouts/:subdomain/pay', verifyAuth, requireAdmin, executePayout);
app.post('/api/admin/rollover', verifyAuth, requireAdmin, triggerManualRollover);
app.get('/api/admin/support', verifyAuth, requireAdmin, getAllSupportTickets);
app.put('/api/admin/support/:id', verifyAuth, requireAdmin, updateSupportTicketStatus);
app.post('/api/admin/notifications', verifyAuth, requireAdmin, createNotification);
app.get('/api/admin/notifications', verifyAuth, requireAdmin, getAdminNotifications);

// CMS Routes (Auth required, generic platform endpoints for creators managing their own content)
app.post('/api/upload', verifyAuth, requireCreator, uploadMiddleware, handleImageUpload);
app.delete('/api/upload', verifyAuth, requireCreator, handleImageDelete);
app.get('/api/blogs', verifyAuth, requireCreator, getBlogs);
app.post('/api/blogs', verifyAuth, requireCreator, createBlog);
app.get('/api/blogs/:id', verifyAuth, requireCreator, getBlogById);
app.put('/api/blogs/:id', verifyAuth, requireCreator, updateBlog);
app.delete('/api/blogs/:id', verifyAuth, requireCreator, deleteBlog);

app.get('/api/categories', verifyAuth, requireCreator, getCategories);
app.post('/api/categories', verifyAuth, requireCreator, createCategory);
app.delete('/api/categories/:id', verifyAuth, requireCreator, deleteCategory);

app.get('/api/tags', verifyAuth, requireCreator, getTags);
app.post('/api/tags', verifyAuth, requireCreator, createTag);
app.delete('/api/tags/:id', verifyAuth, requireCreator, deleteTag);

// Instagram Integration Routes
app.get('/api/instagram/auth-url', verifyAuth, requireCreator, generateAuthUrl);
app.get('/api/instagram/callback', handleCallback); // Public callback
app.get('/api/instagram/accounts', verifyAuth, requireCreator, getAccounts);
app.get('/api/instagram/media', verifyAuth, requireCreator, getMedia);
app.delete('/api/instagram/account', verifyAuth, requireCreator, disconnectAccount);

// Auto DM Rules Routes
app.get('/api/auto-dm/rules', verifyAuth, requireCreator, getRules);
app.post('/api/auto-dm/rules', verifyAuth, requireCreator, createRule);
app.put('/api/auto-dm/rules/:id', verifyAuth, requireCreator, updateRule);
app.delete('/api/auto-dm/rules/:id', verifyAuth, requireCreator, deleteRule);

// Apply Tenant Middleware for Subdomain Routes
app.use(tenantMiddleware);

// Protected Tenant Routes (Auth required for tenant-specific data if any)
app.get('/api/dashboard', verifyAuth, (req, res) => {
    if (!req.tenant) {
        res.status(401).json({ error: 'Unauthorized: No tenant found' });
        return;
    }
    res.json({ message: 'Welcome to your dashboard!', tenant: req.tenant });
});

// Public Tenant Routes
app.get('/api/public/creator', getPublicCreatorInfo);
app.get('/api/public/blogs', getPublicBlogs);
app.get('/api/public/blogs/:slug', getPublicBlogBySlug);
app.get('/api/public/categories', getPublicCategories);
app.get('/api/public/tags', getPublicTags);
app.get('/api/public/ads', getPublicAds);

// Start background workers
startViewSyncWorker();

const PORT = process.env.PORT || 3000;

// Initialize background jobs
initCronJobs();

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
