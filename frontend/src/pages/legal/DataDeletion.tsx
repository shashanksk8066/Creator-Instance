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
        <p className="text-gray-600 mb-6">Last Updated: 21 July 2026</p>
        
        <div className="prose prose-blue max-w-none text-gray-700">
          <p className="mb-4 text-lg">
            Creator Instance respects your privacy and provides you with the ability to delete your data at any time.
          </p>
          <p className="mb-8 text-lg">
            If you no longer wish to use Creator Instance, you can disconnect your Instagram account and request deletion of all associated data.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">What Data Will Be Deleted?</h2>
          <p className="mb-4">When your data is deleted, we permanently remove:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Connected Instagram account information</li>
            <li>Instagram access tokens</li>
            <li>Auto-DM keyword rules</li>
            <li>Automated message templates</li>
            <li>Automation settings and preferences</li>
            <li>Any other data associated with your connected account</li>
          </ul>
          <p className="mb-8 font-medium">We do not retain your data after deletion unless required by applicable law.</p>

          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 mb-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Option 1: Delete Your Data from Creator Instance <span className="text-sm font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full ml-2 align-middle">Recommended</span></h2>
            <ol className="list-decimal pl-6 mb-6 space-y-2 text-gray-700">
              <li>Log in to your Creator Instance Dashboard.</li>
              <li>Navigate to <span className="font-semibold text-gray-900">Settings</span> → <span className="font-semibold text-gray-900">Instagram Integration</span>.</li>
              <li>Click <span className="font-semibold text-gray-900">Disconnect Account</span>.</li>
              <li>Confirm the deletion request.</li>
            </ol>
            <p className="mb-4 text-gray-700 font-medium">This will:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Disconnect your Instagram account.</li>
              <li>Revoke our access to your Instagram account.</li>
              <li>Permanently delete your automation settings.</li>
              <li>Remove your associated account data from our systems.</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 mb-10 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Option 2: Remove Creator Instance from Meta</h2>
            <p className="mb-6 text-gray-700">You may also revoke our access directly through your Meta account.</p>
            <ol className="list-decimal pl-6 mb-6 space-y-2 text-gray-700">
              <li>Open Facebook.</li>
              <li>Navigate to <span className="font-semibold text-gray-900">Settings & Privacy</span> → <span className="font-semibold text-gray-900">Settings</span>.</li>
              <li>Open <span className="font-semibold text-gray-900">Business Integrations</span> (or the equivalent integrations section available in your Meta account).</li>
              <li>Select <span className="font-semibold text-gray-900">Creator Instance</span>.</li>
              <li>Click <span className="font-semibold text-gray-900">Remove</span>.</li>
            </ol>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
              <p className="font-medium text-blue-900 text-sm">Once access is revoked, Creator Instance will no longer be able to access your Instagram account. Any remaining account data will be removed from our systems during our regular cleanup process.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">Manual Data Deletion Request</h2>
          <p className="mb-4">If you prefer, you may request manual deletion by contacting us.</p>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-6">
            <p className="mb-2"><span className="font-medium">Email:</span> <a href="mailto:support@creatorinstance.in" className="text-blue-600 hover:underline">support@creatorinstance.in</a></p>
            <p className="mb-2"><span className="font-medium">Subject:</span> Data Deletion Request</p>
            <p className="font-medium mt-4 mb-2">Please include:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your Instagram username</li>
              <li>The email address associated with your Creator Instance account (if applicable)</li>
            </ul>
          </div>
          <p className="mb-8 font-medium text-gray-800">We will verify your request and permanently delete your data within 48 hours.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">Contact Us</h2>
          <p className="mb-4">If you have any questions regarding data deletion, please contact:</p>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-8">
            <h3 className="font-bold text-gray-900 mb-2">Creator Instance Support</h3>
            <p className="mb-1"><span className="font-medium">Email:</span> <a href="mailto:support@creatorinstance.in" className="text-blue-600 hover:underline">support@creatorinstance.in</a></p>
            <p><span className="font-medium">Website:</span> <a href="https://creatorinstance.in" className="text-blue-600 hover:underline">https://creatorinstance.in</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};
