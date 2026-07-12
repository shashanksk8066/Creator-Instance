import { useState, useEffect } from 'react';
import { auth } from '../../config/firebase';
import { Bell, Plus, CheckCircle2 } from 'lucide-react';

export const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('ALL');
  const [type, setType] = useState('info');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [creators, setCreators] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(await res.json());
      }
      
      const resCreators = await fetch('/api/admin/creators/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resCreators.ok) {
        setCreators(await resCreators.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, message, target, type })
      });

      if (res.ok) {
        setTitle('');
        setMessage('');
        setTarget('ALL');
        setType('info');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Bell className="text-blue-600" />
            Send Notifications
          </h1>
          <p className="text-gray-500 mt-1">Broadcast messages to all creators or target specific users.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create Notification</h2>
            
            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 size={16} /> Notification Sent!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                  <select
                    value={target === 'ALL' ? 'ALL' : 'SPECIFIC'}
                    onChange={e => {
                      if (e.target.value === 'ALL') {
                        setTarget('ALL');
                      } else {
                        setTarget(creators[0]?.uid || '');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="ALL">All Creators (Broadcast)</option>
                    <option value="SPECIFIC">Specific Creator</option>
                  </select>
                </div>

                {target !== 'ALL' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specific Creator</label>
                    <select
                      value={target}
                      onChange={e => setTarget(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {creators.length === 0 && <option value="">No creators found</option>}
                      {creators.map(c => (
                        <option key={c.uid} value={c.uid}>
                          {c.subdomain ? `${c.subdomain}.${import.meta.env.VITE_BASE_DOMAIN || 'creatoros.com'} - ` : ''}{c.firstName} {c.lastName} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="info">Information (Blue)</option>
                    <option value="success">Success (Green)</option>
                    <option value="warning">Warning (Yellow)</option>
                    <option value="error">Alert / Error (Red)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. System Update"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Notification content..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                {submitting ? 'Sending...' : 'Send Notification'}
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Sent History</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No notifications sent yet.</div>
            ) : (
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Notification</th>
                    <th className="px-6 py-4">Target</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {notifications.map((n, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${
                            n.type === 'success' ? 'bg-green-500' :
                            n.type === 'warning' ? 'bg-yellow-500' :
                            n.type === 'error' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`} />
                          <p className="font-semibold text-gray-900">{n.title}</p>
                        </div>
                        <p className="text-gray-500 text-xs mt-1 truncate max-w-sm">{n.message}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700">
                          {n.target === 'ALL' ? 'ALL' : (
                            creators.find(c => c.uid === n.target)?.subdomain 
                              ? `${creators.find(c => c.uid === n.target)?.subdomain}.${import.meta.env.VITE_BASE_DOMAIN || 'creatoros.com'}` 
                              : n.target
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                        {new Date(n.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
