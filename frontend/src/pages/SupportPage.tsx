import React from 'react';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, HelpCircle, ArrowLeft } from 'lucide-react';

export const SupportPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navigation */}
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

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-6">
          <HelpCircle size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
          How can we help you?
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Whether you have a question about setting up Auto-DMs, monetization, or your instance, our team is here to assist.
        </p>
      </section>

      {/* Support Options */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Email Support Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Mail size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Email Support</h3>
            <p className="text-gray-600 leading-relaxed mb-8">
              Send us an email and we'll get back to you within 24 hours. Best for technical issues and account inquiries.
            </p>
            <a href="mailto:support@creatorinstance.in" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 bg-blue-50 px-6 py-3 rounded-full transition-colors">
              support@creatorinstance.in
            </a>
          </div>

          {/* FAQ / Community (Placeholder) */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <MessageCircle size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Community & FAQ</h3>
            <p className="text-gray-600 leading-relaxed mb-8">
              Check out our knowledge base for quick answers to common questions about setting up your instance.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 text-gray-900 font-bold hover:text-black bg-gray-100 px-6 py-3 rounded-full transition-colors">
              Browse Articles (Coming Soon)
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
};
