import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle, CheckCircle, Trash2, Plus } from 'lucide-react';

interface InstagramAccount {
  accountId: string;
  username: string;
  accessToken: string;
}

export const InstagramIntegration = () => {
  const { currentUser: user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/instagram/accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const igAccountsMap = await res.json();
        const accountsList = Object.values(igAccountsMap) as InstagramAccount[];
        setAccounts(accountsList);
      } else {
        console.error('Failed to fetch Instagram accounts:', await res.text());
      }
    } catch (err) {
      console.error('Failed to fetch Instagram accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/instagram/auth-url', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      } else {
        alert('Failed to generate auth URL');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to Instagram');
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account? All associated Auto DM rules will also be deleted.')) return;
    
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/instagram/account', {
        method: 'DELETE',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accountId })
      });
      
      if (res.ok) {
        setAccounts(accounts.filter(a => a.accountId !== accountId));
      } else {
        alert('Failed to disconnect account');
      }
    } catch (err) {
      console.error(err);
      alert('Error disconnecting account');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Checking connections...</div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instagram Auto DM</h1>
          <p className="text-gray-500 mt-1">Connect your Instagram professional accounts to automate private replies.</p>
        </div>
        <button
          onClick={handleConnect}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Plus size={20} />
          Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.length > 0 ? (
          accounts.map(account => (
            <div key={account.accountId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-sm">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">@{account.username}</h3>
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <CheckCircle size={14} />
                      <span>Connected</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-6">This account is successfully linked and ready for Auto DMs.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.href = '/dashboard/auto-dm/rules'}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium border border-gray-200"
                >
                  Manage Rules
                </button>
                <button
                  onClick={() => handleDisconnect(account.accountId)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                  title="Disconnect Account"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
              <MessageCircle size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Accounts Connected</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              You must have an Instagram Professional or Creator account connected to a Facebook Page to use this feature.
            </p>
            <button
              onClick={handleConnect}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Plus size={20} />
              Connect Instagram
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
