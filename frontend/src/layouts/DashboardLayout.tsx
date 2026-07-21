import { Loader } from '../components/Loader';
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { auth } from '../config/firebase';
import { Clock, AlertTriangle, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

export const DashboardLayout = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <Loader fullScreen text="Loading dashboard..." />;
  }

  // Handle Rejected State - Full Screen Alert (No Layout)
  if (profile?.status === 'Rejected') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-red-200 shadow-lg overflow-hidden">
          <div className="p-6 bg-red-50 flex flex-col items-center text-center border-b border-red-200">
            <AlertTriangle size={48} className="text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Application Rejected</h2>
            <p className="text-sm text-red-600">
              Unfortunately, your creator application for Creator Instance has been declined by the admin team.
            </p>
          </div>
          <div className="p-6 flex justify-center bg-white">
            <button 
              onClick={() => signOut(auth)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-md transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Pending State - With Layout but locked content
  if (profile?.status === 'Pending') {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="max-w-3xl mx-auto mt-12">
              <Card className="p-8 flex flex-col items-center text-center">
                <Clock size={48} className="text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Account On Hold</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Access to your creator dashboard and automation features has been temporarily suspended. If you believe this is an error, please reach out to our support team to resolve this issue.
                </p>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Normal Approved State
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900 relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar Wrapper */}
      <div className={`fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-transform duration-200 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar profile={profile} onMenuClick={() => setIsMobileMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Topbar profile={profile} onOpenMenu={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <Outlet context={{ profile }} />
        </main>
      </div>
    </div>
  );
};
