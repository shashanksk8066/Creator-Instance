import { Loader } from '../../components/Loader';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Settings, User, Mail, Shield, CheckCircle2, AlertTriangle, Key } from 'lucide-react';

export const CreatorSettings = () => {
  const { profile } = useOutletContext<{ profile: any }>();
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordReset = async () => {
    try {
      setError('');
      if (!profile?.email) throw new Error('No email found for this account.');
      await sendPasswordResetEmail(auth, profile.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send password reset email.');
    }
  };

  if (!profile) return <Loader text="Loading settings..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Settings className="text-blue-600" />
            Account Settings
          </h1>
          <p className="text-gray-500 mt-1">Manage your account details and security.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <User size={18} className="text-blue-500" />
              Personal Details
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                <p className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">{profile.fullName}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Creator Category</label>
                <p className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 capitalize">{profile.creatorCategory || 'Uncategorized'}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Mail size={12}/> Email Address</label>
              <p className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">{profile.email}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Subdomain</label>
              <p className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                {profile.subdomain}.{import.meta.env.VITE_BASE_DOMAIN || 'creatoros.com'}
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Member Since</label>
              <p className="text-sm text-gray-700">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield size={18} className="text-blue-500" />
                Account Status
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Application Status</p>
                  <p className="text-xs text-gray-500 mt-0.5">Your domain approval</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                  profile.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                  profile.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                  {profile.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Key size={18} className="text-blue-500" />
                Security
              </h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Need to update your password? We can send a secure password reset link directly to your email address (<strong>{profile.email}</strong>).
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-center gap-2">
                  <AlertTriangle size={16} /> {error}
                </div>
              )}

              {resetSent ? (
                <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm flex items-center gap-2 font-medium">
                  <CheckCircle2 size={16} /> Reset link sent! Check your inbox.
                </div>
              ) : (
                <button
                  onClick={handlePasswordReset}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center gap-2"
                >
                  <Key size={16} />
                  Send Password Reset Email
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
