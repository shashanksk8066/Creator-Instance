import React from 'react';
import { Logo } from '../../components/Logo';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const DataDeletion = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <nav className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/">
             <Logo size="md" />
          </Link>
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black mb-8">User Data Deletion Instructions</h1>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-lg text-gray-600 mb-8">
            According to Meta and Facebook Platform rules, we must provide users with a clear way to request the deletion of their data. Creator Instance does not save your personal data beyond what is strictly necessary to perform Instagram Auto-DM automation.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">How to Delete Your Data</h2>
          <p className="mb-4">If you want to remove your Instagram account connection and delete all associated data from Creator Instance, you have two options:</p>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
            <h3 className="text-xl font-bold mb-3">Option 1: Delete via Creator Instance Dashboard (Recommended)</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Log in to your Creator Instance Dashboard.</li>
              <li>Navigate to <strong>Settings</strong> &gt; <strong>Instagram Integration</strong>.</li>
              <li>Click the <strong>Disconnect Account</strong> button.</li>
              <li>This will immediately revoke our access to your Instagram account and permanently delete all your Auto-DM rules and associated data from our database.</li>
            </ol>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
            <h3 className="text-xl font-bold mb-3">Option 2: Delete via Meta / Instagram</h3>
            <p className="mb-4">You can also remove our app's access directly from your Instagram or Facebook settings:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Go to your Facebook profile and navigate to <strong>Settings & Privacy</strong> &gt; <strong>Settings</strong>.</li>
              <li>Look for <strong>Security and Login</strong> or <strong>Business Integrations</strong>.</li>
              <li>Find <strong>Creator Instance</strong> in the list of active integrations.</li>
              <li>Click <strong>Remove</strong>.</li>
              <li>Once removed, we will automatically delete your data from our systems during our next routine database sync, as we will no longer have an active token.</li>
            </ol>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">Contact for Manual Deletion</h2>
          <p>
            If you need us to manually verify your data deletion, please email our support team with the subject line <strong>"Data Deletion Request"</strong>. Include the email address associated with your account, and we will process the complete deletion within 48 hours.
          </p>
        </div>
      </div>
    </div>
  );
};
