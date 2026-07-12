import { Loader } from '../../components/Loader';
import { useState, useEffect } from 'react';
import { auth } from '../../config/firebase';
import { 
  Users, 
  Eye, 
  MessageSquare, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  LayoutDashboard
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const AdminOverview = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/analytics/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setChartData(data.chartData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading overview..." />;
  if (!metrics) return <div className="p-8 text-center text-red-500">Failed to load analytics.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="text-blue-600" />
            Platform Overview
          </h1>
          <p className="text-gray-500 mt-1">Overall performance across all creators and subdomains.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Today's Page Views" 
          value={metrics.todayViews.toLocaleString()} 
          subText={`Total: ${metrics.totalViews.toLocaleString()}`}
          growth={metrics.viewsGrowth} 
          icon={<Eye className="text-blue-500" />} 
          color="blue" 
        />
        <StatCard 
          title="Today's DMs Sent" 
          value={metrics.todayDMs.toLocaleString()} 
          subText={`Total DMs: ${metrics.totalDMs.toLocaleString()} | Accounts: ${metrics.totalConnectedAccounts}`}
          growth={metrics.dmGrowth} 
          icon={<MessageSquare className="text-purple-500" />} 
          color="purple" 
        />
        <StatCard 
          title="Active Queues" 
          value={metrics.activeQueues.toLocaleString()} 
          subText="Pending DM tasks"
          growth={0} 
          icon={<TrendingUp className="text-pink-500" />} 
          color="pink" 
        />
        <StatCard 
          title="Today's Revenue" 
          value={`$${metrics.todayRevenue.toLocaleString()}`} 
          subText={`Total: $${metrics.totalRevenue.toLocaleString()}`}
          growth={metrics.revenueGrowth} 
          icon={<DollarSign className="text-emerald-500" />} 
          color="emerald" 
        />
        <StatCard 
          title="Active Creators" 
          value={metrics.totalCreators.toLocaleString()} 
          subText="Total approved users"
          growth={0} 
          icon={<Users className="text-orange-500" />} 
          color="orange" 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Platform Growth (Last 7 Days)</h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div> Page Views
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div> DMs Sent
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Revenue
            </div>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDms" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              />
              <Area yAxisId="left" type="monotone" dataKey="views" name="Page Views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              <Area yAxisId="left" type="monotone" dataKey="dms" name="DMs Sent" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorDms)" />
              <Area yAxisId="right" type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subText, growth, icon, color }: { title: string, value: string, subText?: string, growth: number, icon: any, color: string }) => {
  const isPositive = growth >= 0;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden group hover:border-gray-300 transition-all flex flex-col justify-between">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform`}></div>
      <div className="flex justify-between items-start relative z-10 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          {subText && <p className="text-xs text-gray-400 mt-1 font-medium whitespace-nowrap">{subText}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          {icon}
        </div>
      </div>
      <div className="mt-auto flex items-center gap-2 relative z-10">
        {growth !== 0 ? (
          <>
            <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-md`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(growth).toFixed(1)}%
            </div>
            <span className="text-xs text-gray-500 font-medium">vs yesterday</span>
          </>
        ) : (
          <span className="text-xs text-gray-500 font-medium">Constant</span>
        )}
      </div>
    </div>
  );
};
