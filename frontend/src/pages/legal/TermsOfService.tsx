import React from 'react';
import { Logo } from '../../components/Logo';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const TermsOfService = () => {
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
        <h1 className="text-4xl font-black mb-8">Terms of Service</h1>
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-blue max-w-none">
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-6">By accessing and using Creator Instance, you accept and agree to be bound by the terms and provision of this agreement.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Description of Service</h2>
          <p className="mb-6">Creator Instance provides automation tools for Instagram creators, specifically keyword-based comment replies via Direct Messages. We connect to your account via the official Meta Graph API.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. User Responsibilities</h2>
          <p className="mb-4">As a user of our service, you agree to:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Comply with all Meta and Instagram platform terms and policies.</li>
            <li>Not use our automation tools to send spam or unsolicited messages.</li>
            <li>Maintain the security of your account credentials.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Account Suspension</h2>
          <p className="mb-6">We reserve the right to suspend or terminate accounts that violate these terms or Instagram's community guidelines.</p>
        </div>
      </div>
    </div>
  );
};
