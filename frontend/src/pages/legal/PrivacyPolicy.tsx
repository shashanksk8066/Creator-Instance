import React from 'react';
import { Logo } from '../../components/Logo';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPolicy = () => {
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
        <h1 className="text-4xl font-black mb-8">Privacy Policy</h1>
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-blue max-w-none">
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">When you use Creator Instance to automate your Instagram Direct Messages, we may collect:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Your Instagram account username and profile picture.</li>
            <li>Information about comments on your posts that trigger automation rules.</li>
            <li>Basic account information necessary to deliver our services.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use the collected information strictly for the following purposes:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>To detect trigger keywords on your Instagram comments.</li>
            <li>To send automated Direct Messages on your behalf via the Instagram Messenger API.</li>
            <li>To display your connected account status within our dashboard.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Sharing</h2>
          <p className="mb-6">We do not sell, rent, or trade your personal information. Data is only shared with Meta (Instagram) APIs as strictly necessary to perform the automation functions you explicitly authorize.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact our support team.</p>
        </div>
      </div>
    </div>
  );
};
