import { Loader } from '../../components/Loader';
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { auth } from '../../config/firebase';

export const MetaSettings = () => {
  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [webhookVerifyToken, setWebhookVerifyToken] = useState('');
  const [oauthRedirectUri, setOauthRedirectUri] = useState('');
  const [adsterraApiKey, setAdsterraApiKey] = useState('');
  const [googleDriveFolderLink, setGoogleDriveFolderLink] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [googleRefreshToken, setGoogleRefreshToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/admin/settings/meta', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAppId(data.appId || '');
          setAppSecret(data.appSecret || '');
          setWebhookVerifyToken(data.webhookVerifyToken || '');
          setOauthRedirectUri(data.oauthRedirectUri || '');
          setAdsterraApiKey(data.adsterraApiKey || '');
          setGoogleDriveFolderLink(data.googleDriveFolderLink || '');
          setGoogleClientId(data.googleClientId || '');
          setGoogleClientSecret(data.googleClientSecret || '');
          setGoogleRefreshToken(data.googleRefreshToken || '');
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/settings/meta', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          appId, appSecret, webhookVerifyToken, oauthRedirectUri, adsterraApiKey, 
          googleDriveFolderLink, googleClientId, googleClientSecret, googleRefreshToken 
        })
      });

      if (!res.ok) throw new Error('Failed to save');
      alert('Settings saved successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader text="Loading settings..." />;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration</h1>
          <p className="text-gray-500 mt-1">Configure platform integrations and API credentials.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium shadow-sm"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Meta Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-semibold text-gray-900">Meta API Settings</h2>
            <p className="text-sm text-gray-500 mt-1">Configure Facebook & Instagram integration credentials.</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">App ID</label>
              <input 
                type="text" 
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors"
                placeholder="e.g. 123456789012345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">App Secret</label>
              <input 
                type="password" 
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors"
                placeholder="••••••••••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Verify Token</label>
              <input 
                type="text" 
                value={webhookVerifyToken}
                onChange={(e) => setWebhookVerifyToken(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors"
                placeholder="e.g. multi-tenant-secret-2026"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OAuth Callback URL</label>
              <input 
                type="text" 
                value={oauthRedirectUri}
                onChange={(e) => setOauthRedirectUri(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors"
                placeholder="e.g. https://your-ngrok.app/api/instagram/callback"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Callback URL</label>
              <input 
                type="text" 
                value={oauthRedirectUri ? `${oauthRedirectUri.split('/api/instagram')[0]}/webhook` : ''}
                disabled
                className="w-full bg-gray-100 border border-gray-200 text-gray-500 rounded-lg cursor-not-allowed block p-2.5 outline-none"
                placeholder="Auto-generated from OAuth URL"
              />
            </div>
          </div>
        </div>

        {/* Adsterra Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-semibold text-gray-900">Adsterra Integration</h2>
            <p className="text-sm text-gray-500 mt-1">Configure your publisher API key to sync revenue data.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Publisher API Key</label>
            <input 
              type="password" 
              value={adsterraApiKey}
              onChange={(e) => setAdsterraApiKey(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors"
              placeholder="••••••••••••••••••••••••••••••••"
            />
          </div>
        </div>

        {/* Google Drive Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit lg:col-span-2">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-semibold text-gray-900">Google Drive Backup</h2>
            <p className="text-sm text-gray-500 mt-1">Configure automated image backups using Google OAuth2 to bypass service account quota limits.</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drive Folder Link</label>
              <input 
                type="text" 
                value={googleDriveFolderLink}
                onChange={(e) => setGoogleDriveFolderLink(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors"
                placeholder="e.g. https://drive.google.com/drive/folders/1Ix72ai..."
              />
              <p className="text-xs text-gray-500 mt-2">Paste the full URL of your personal Google Drive folder.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Client ID</label>
                <input 
                  type="text" 
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors"
                  placeholder="e.g. 12345-abcde.apps.googleusercontent.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Client Secret</label>
                <input 
                  type="password" 
                  value={googleClientSecret}
                  onChange={(e) => setGoogleClientSecret(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors"
                  placeholder="••••••••••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OAuth Refresh Token</label>
              <input 
                type="password" 
                value={googleRefreshToken}
                onChange={(e) => setGoogleRefreshToken(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors"
                placeholder="1//0eX..."
              />
              <p className="text-xs text-gray-500 mt-2">The offline refresh token generated from Google OAuth Playground or your custom script.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
