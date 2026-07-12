import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';

export const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConsent, setShowConsent] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    socialPageLink: '',
    followersCount: '',
    creatorCategory: '',
    country: 'US',
    requestedSubdomain: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = e.target.value;
    
    if (e.target.name === 'requestedSubdomain') {
      // Only allow lowercase alphabets and max 15 chars
      value = value.toLowerCase().replace(/[^a-z]/g, '').slice(0, 15);
    }
    
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      // Log them in immediately
      await signInWithEmailAndPassword(auth, formData.email, formData.password);

      // Registration successful, navigate to dashboard directly
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create your account</h3>
        <p className="text-sm text-gray-500 mt-2">Fill out your creator profile to launch your platform.</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Personal Details Section */}
        <div className="space-y-5">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">Personal Details</h4>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email address</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border bg-gray-50" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
              <input required type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="+1234567890" className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input required type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" minLength={6} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border bg-gray-50" />
            </div>
          </div>
        </div>

        {/* Professional Info Section */}
        <div className="space-y-5">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">Professional Info</h4>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Primary Social Link</label>
            <input required type="url" name="socialPageLink" value={formData.socialPageLink} onChange={handleChange} placeholder="https://instagram.com/yourusername" className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border bg-gray-50" />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Followers</label>
              <input required type="number" name="followersCount" value={formData.followersCount} onChange={handleChange} placeholder="10000" className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <input required type="text" name="creatorCategory" value={formData.creatorCategory} onChange={handleChange} placeholder="e.g. Lifestyle, Gaming" className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
              <select name="country" value={formData.country} onChange={handleChange} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border bg-white">
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="IN">India</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
              </select>
            </div>
          </div>
        </div>

        {/* Platform Setup Section */}
        <div className="space-y-4 bg-blue-50/50 p-5 rounded-xl border border-blue-100">
           <div>
             <label className="block text-sm font-bold text-gray-900 mb-1">Choose your custom link</label>
             <p className="text-xs text-gray-500 mb-3">This is the unique URL where fans will visit your hub.</p>
             <div className="flex rounded-lg shadow-sm">
                <input required type="text" name="requestedSubdomain" value={formData.requestedSubdomain} onChange={handleChange} maxLength={15} placeholder="yourname" className="flex-1 min-w-0 block w-full px-4 py-3 rounded-none rounded-l-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium" />
                <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-gray-300 bg-gray-100 text-gray-600 sm:text-sm font-medium">
                  .{import.meta.env.VITE_BASE_DOMAIN || 'creatoros.com'}
                </span>
             </div>
           </div>
        </div>

        {/* Consent Section */}
        <div className="flex items-start gap-3 mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center h-5">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              required
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
          </div>
          <div className="text-sm">
            <label htmlFor="consent" className="font-medium text-gray-700 cursor-pointer">
              I agree to the Platform Terms & Consent
            </label>
            <p className="text-gray-500 mt-1">
              By checking this box, you agree to how we handle your Instagram account, personal data, and platform usage. 
              <button 
                type="button" 
                onClick={() => setShowConsent(true)}
                className="text-blue-600 hover:underline font-medium ml-1"
              >
                Read full consent terms.
              </button>
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors mt-8"
          >
            {loading ? 'Creating Platform...' : 'Launch Creator Platform'}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <span className="text-gray-500">Already have an account? </span>
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Sign in
        </Link>
      </div>

      {/* Consent Modal */}
      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Platform Terms & Data Consent</h2>
              <button onClick={() => setShowConsent(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-600 leading-relaxed">
              
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">1. Personal Information Handling</h3>
                <p>We take your privacy seriously. The personal information you provide (Name, Email, Phone Number, etc.) is securely stored in our database. <strong className="text-gray-900">Please note that your Full Name and Email Address will be publicly displayed on the "About" section of your custom blog</strong> so your fans and brands can contact you. Do not provide an email if you do not want it exposed.</p>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">2. Instagram Account Handling</h3>
                <p>By connecting your Instagram account, you grant Creator Instance permission to read comments on your posts and send Direct Messages on your behalf. We only automate responses based on the specific rules you configure. We do not have access to your Instagram password, and you can revoke our access at any time through your Facebook/Instagram security settings.</p>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">3. Safety & Rate Limits</h3>
                <p>To protect your Instagram account from spam flags, we enforce strict internal rate limits. A maximum of one DM will be sent every 18 seconds, and we apply a strict 24-hour deduplication rule (no user will receive the same automated DM twice within 24 hours). This human-like pacing ensures your account remains in good standing with Meta's spam policies.</p>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">4. Account Removal & Data Deletion</h3>
                <p>You have the absolute right to be forgotten. If an Admin deletes your account, or if you request account deletion, all associated data is permanently wiped from our servers via a cascading delete. This includes your profile, subdomains, blogs, auto-DM rules, logs, and Firebase Authentication records. This action cannot be undone.</p>
              </div>

            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => {
                  setConsentChecked(true);
                  setShowConsent(false);
                }}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                I Understand & Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
