import { Outlet, NavLink, Link } from 'react-router-dom';
import { Layers, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useState, useEffect } from 'react';
import { BeforeHeaderAds, AfterHeaderAds, BeforeFooterAds, BodyStartAds, CtaPopunderAds } from '../components/ads/AdPlacements';
import { Logo } from '../components/Logo';

export const PublicLayout = () => {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [creatorName, setCreatorName] = useState<string>('Creator');
  
  const subdomain = window.location.hostname.split('.')[0];
  const baseDomain = import.meta.env.VITE_BASE_DOMAIN || 'localhost';

  useEffect(() => {
    const verifyCreator = async () => {
      try {
        const res = await fetch('/api/public/creator');
        if (res.ok) {
          const data = await res.json();
          if (data?.fullName) setCreatorName(data.fullName);
        } else if (res.status === 404) {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Failed to verify creator", err);
      } finally {
        setLoading(false);
      }
    };
    verifyCreator();
  }, []);

  useEffect(() => {
    if (notFound && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (notFound && countdown <= 0) {
      let targetDomain = baseDomain === 'localhost' ? 'localhost' : baseDomain;
      if (targetDomain.includes(':')) {
        targetDomain = targetDomain.split(':')[0];
      }
      const port = window.location.port ? `:${window.location.port}` : '';
      const protocol = window.location.protocol;
      window.location.href = `${protocol}//${targetDomain}${port}`;
    }
  }, [notFound, countdown, baseDomain]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) => clsx(
    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
    isActive 
      ? "text-blue-600 bg-blue-50" 
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
  );

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! This creator page doesn't exist.</h1>
          <p className="text-gray-600 mb-8">
            The subdomain <strong className="text-gray-900">"{subdomain}"</strong> was not found on our platform.
          </p>
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
            Redirecting to home page in <span className="font-bold text-blue-600">{countdown}</span> seconds...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <BodyStartAds />
      <CtaPopunderAds />
      <BeforeHeaderAds />
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
            <Logo size="md" />
          </Link>
          <nav className="hidden sm:flex items-center gap-2">
            <NavLink to="/" className={navLinkClass}>Home</NavLink>
            <NavLink to="/blogs" className={navLinkClass}>Blogs</NavLink>
            <NavLink to="/about" className={navLinkClass}>About</NavLink>
          </nav>
        </div>
      </header>
      <AfterHeaderAds />
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <BeforeFooterAds />
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-gray-500 text-sm">© {new Date().getFullYear()} {creatorName}. All rights reserved.</p>
           <a href={`${window.location.protocol}//${baseDomain}`} className="text-gray-400 text-xs hover:text-blue-600 transition-colors">
             Powered by Creator Instance
           </a>
        </div>
      </footer>
    </div>
  );
};
