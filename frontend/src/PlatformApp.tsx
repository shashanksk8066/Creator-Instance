import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { Dashboard } from './pages/dashboard/Dashboard';
import { TaxonomyManager } from './pages/dashboard/TaxonomyManager';
import { BlogManagement } from './pages/dashboard/BlogManagement';
import { BlogEditor } from './pages/dashboard/BlogEditor';
import { Register } from './pages/auth/Register';
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminRoute } from './components/AdminRoute';
import { CreatorRoute } from './components/CreatorRoute';
import { MetaSettings } from './pages/admin/MetaSettings';
import { AdvertisementManagement } from './pages/admin/AdvertisementManagement';
import { AdsRevenue } from './pages/admin/AdsRevenue';
import { AdminPayouts } from './pages/admin/AdminPayouts';
import { InstagramIntegration } from './pages/dashboard/InstagramIntegration';
import { AutoDmRules } from './pages/dashboard/AutoDmRules';
import { AutoDmRuleEditor } from './pages/dashboard/AutoDmRuleEditor';
import { CreatorAdsRevenue } from './pages/dashboard/CreatorAdsRevenue';
import { CreatorPayouts } from './pages/dashboard/CreatorPayouts';
import { CreatorSupport } from './pages/dashboard/CreatorSupport';
import { AdminSupport } from './pages/admin/AdminSupport';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { CreatorSettings } from './pages/dashboard/CreatorSettings';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminCreators } from './pages/admin/AdminCreators';
import { AdminBlogs } from './pages/admin/AdminBlogs';
import { LandingPage } from './pages/LandingPage';
import { SupportPage } from './pages/SupportPage';
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy';
import { TermsOfService } from './pages/legal/TermsOfService';
import { DataDeletion } from './pages/legal/DataDeletion';

export const PlatformApp = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/data-deletion" element={<DataDeletion />} />
      
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
         <Route path="/register" element={<Register />} />
         <Route path="/login" element={<Login />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/status/waiting" element={
            <div className="text-center py-8">
               <h3 className="text-xl font-bold text-gray-900 mb-2">Application Received</h3>
               <p className="text-gray-600">Your creator application is currently pending approval. We will notify you once your custom domain is ready.</p>
            </div>
         } />
      </Route>

      {/* Admin Route */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<AdminOverview />} />
        <Route path="approvals" element={<AdminDashboard />} />
        <Route path="creators" element={<AdminCreators />} />
        <Route path="blogs" element={<AdminBlogs />} />
        <Route path="ads" element={<AdvertisementManagement />} />
        <Route path="ads-revenue" element={<AdsRevenue />} />
        <Route path="payouts" element={<AdminPayouts />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="meta-settings" element={<MetaSettings />} />
        <Route path="profile" element={<CreatorSettings />} />
      </Route>

      {/* Dashboard Routes */}
      <Route path="/dashboard" element={
        <CreatorRoute>
          <DashboardLayout />
        </CreatorRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="blogs" element={<BlogManagement />} />
        <Route path="blogs/new" element={<BlogEditor />} />
        <Route path="blogs/:id" element={<BlogEditor />} />
        <Route path="taxonomy" element={<TaxonomyManager />} />
        <Route path="auto-dm" element={<InstagramIntegration />} />
        <Route path="auto-dm/rules" element={<AutoDmRules />} />
        <Route path="auto-dm/rules/new" element={<AutoDmRuleEditor />} />
        <Route path="auto-dm/rules/:id" element={<AutoDmRuleEditor />} />
        <Route path="ads-revenue" element={<CreatorAdsRevenue />} />
        <Route path="payouts" element={<CreatorPayouts />} />
        <Route path="support" element={<CreatorSupport />} />
        <Route path="settings" element={<CreatorSettings />} />
        <Route path="*" element={<div className="p-8 text-center text-gray-500">Coming Soon</div>} />
      </Route>
    </Routes>
  );
};
