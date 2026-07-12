import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  ShieldCheck, 
  Users,
  Megaphone,
  DollarSign,
  CreditCard,
  HelpCircle,
  Bell,
  BookOpen,
  ChevronRight,
  Settings,
  UserCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Logo } from './Logo';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const NavItem = ({ icon: Icon, label, href, active, hasSubmenu, badge }: any) => {
    // Exact match for /admin to avoid highlighting Overview when in sub-routes
    const isActive = active || (href === '/admin' ? currentPath === '/admin' : (currentPath === href || currentPath.startsWith(`${href}/`)));
    
    return (
      <Link
        to={href}
        className={cn(
          "flex items-center justify-between px-3 py-2.5 mx-2 rounded-md transition-colors text-sm font-medium",
          isActive 
            ? "bg-purple-50 text-purple-700" 
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={18} className={cn("shrink-0", isActive ? "text-purple-600" : "text-gray-400")} />}
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 rounded">
              {badge}
            </span>
          )}
          {hasSubmenu && <ChevronRight size={16} className="text-gray-400" />}
        </div>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col overflow-y-auto hidden md:flex sticky top-0 shadow-sm">
      <div className="py-4 flex items-center justify-center sticky top-0 bg-white z-10 border-b border-gray-100 min-h-[64px]">
        <Logo size="md" />
      </div>

      <div className="py-4 flex-1">
        <NavItem icon={LayoutDashboard} label="Overview" href="/admin" />

        <div className="mt-6 mb-2 px-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">User Management</p>
        </div>
        <NavItem icon={ShieldCheck} label="Pending Approvals" href="/admin/approvals" />
        <NavItem icon={Users} label="All Creators" href="/admin/creators" />

        <div className="mt-6 mb-2 px-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Content</p>
        </div>
        <NavItem icon={BookOpen} label="Blogs Management" href="/admin/blogs" />

        <div className="mt-6 mb-2 px-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Monetization</p>
        </div>
        <NavItem icon={Megaphone} label="Ads Management" href="/admin/ads" />
        <NavItem icon={DollarSign} label="Ads Revenue" href="/admin/ads-revenue" />
        <NavItem icon={CreditCard} label="Payout Requests" href="/admin/payouts" />

        <div className="mt-6 mb-2 px-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Operations</p>
        </div>
        <NavItem icon={HelpCircle} label="Support Tickets" href="/admin/support" />
        <NavItem icon={Bell} label="Send Notifications" href="/admin/notifications" />
        <NavItem icon={Settings} label="Configuration" href="/admin/meta-settings" />

        <div className="mt-4 border-t border-gray-100 pt-4">
           <NavItem icon={UserCircle} label="Profile Settings" href="/admin/profile" />
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
            A
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">Superadmin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
