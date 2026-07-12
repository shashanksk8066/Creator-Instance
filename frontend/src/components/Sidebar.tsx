import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Settings,
  ChevronRight,
  MenuSquare,
  FileText,
  Tags,
  Link as LinkIcon,
  Zap,
  DollarSign,
  CreditCard,
  HelpCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Logo } from './Logo';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const NavItem = ({ icon: Icon, label, href, active, hasSubmenu, badge }: any) => {
    const isActive = active || currentPath === href;
    return (
      <Link
        to={href}
        className={cn(
          "flex items-center justify-between px-3 py-2.5 mx-2 rounded-md transition-colors text-sm font-medium",
          isActive 
            ? "bg-blue-50 text-blue-700" 
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={18} className={cn("shrink-0", isActive ? "text-blue-600" : "text-gray-400")} />}
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 rounded">
              {badge}
            </span>
          )}
          {hasSubmenu && <ChevronRight size={16} className="text-gray-400" />}
        </div>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col overflow-y-auto hidden md:flex sticky top-0">
      <div className="py-4 flex items-center justify-center sticky top-0 bg-white z-10 border-b border-gray-100 min-h-[64px]">
        <Logo size="md" />
      </div>

      <div className="py-4 flex-1">
        <NavItem icon={LayoutDashboard} label="Overview" href="/dashboard" />

        <div className="mt-6 mb-2 px-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Content</p>
        </div>
        
        <NavItem icon={FileText} label="All Blogs" href="/dashboard/blogs" />
        <NavItem icon={Tags} label="Categories & Tags" href="/dashboard/taxonomy" />
        <div className="mt-6 mb-2 px-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Instagram</p>
        </div>
        <NavItem icon={LinkIcon} label="Connect Instagram" href="/dashboard/auto-dm" />
        <NavItem icon={Zap} label="Set Auto DM" href="/dashboard/auto-dm/rules" />

        <div className="mt-6 mb-2 px-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Monetization</p>
        </div>
        <NavItem icon={DollarSign} label="Ads Revenue" href="/dashboard/ads-revenue" />
        <NavItem icon={CreditCard} label="Payouts" href="/dashboard/payouts" />

        <div className="mt-6 mb-2 px-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Help</p>
        </div>
        <NavItem icon={HelpCircle} label="Support & Feedback" href="/dashboard/support" />

        <div className="mt-4 border-t border-gray-100 pt-4">
           <NavItem icon={Settings} label="Settings" href="/dashboard/settings" />
        </div>
      </div>
    </aside>
  );
};
