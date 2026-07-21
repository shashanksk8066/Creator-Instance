import { useState, useEffect } from 'react';
import { Bell, ExternalLink, LogOut, X, Info, AlertTriangle, CheckCircle, Menu } from 'lucide-react';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { clsx } from 'clsx';

export const Topbar = ({ profile, onOpenMenu }: { profile?: any, onOpenMenu?: () => void }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await fetch('/api/dashboard/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`/api/dashboard/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Remove it from UI instantly
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Construct absolute URL for the tenant site
  const siteUrl = profile?.subdomain 
    ? `http://${profile.subdomain}.${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/`
    : '/';

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3 md:gap-4">
        <button onClick={onOpenMenu} className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
          <Menu size={24} />
        </button>
        {profile?.subdomain && (
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            {profile.subdomain}.{import.meta.env.VITE_BASE_DOMAIN || 'creatoros.com'}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                <span className="text-xs text-gray-500">{notifications.length} unread</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex gap-2">
                          <div className="mt-0.5">
                            {notif.type === 'success' && <CheckCircle size={16} className="text-green-600" />}
                            {notif.type === 'warning' && <AlertTriangle size={16} className="text-yellow-600" />}
                            {notif.type === 'error' && <AlertTriangle size={16} className="text-red-600" />}
                            {notif.type === 'info' && <Info size={16} className="text-blue-600" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 leading-tight">{notif.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => markAsRead(notif.id)}
                          className="text-gray-400 hover:text-gray-900 p-1"
                          title="Mark as read"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <a href={siteUrl} target="_blank" rel="noreferrer" className="hidden md:flex items-center gap-2 px-3 py-1.5 ml-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          <ExternalLink size={16} className="text-gray-500" />
          <span>View Site</span>
        </a>

        <button 
          onClick={() => signOut(auth)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 ml-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
