import { Loader } from '../components/Loader';
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { Topbar } from '../components/Topbar';
import { auth } from '../config/firebase';

export const AdminLayout = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    return <Loader fullScreen text="Loading admin panel..." />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar profile={profile} />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet context={{ profile }} />
        </main>
      </div>
    </div>
  );
};
