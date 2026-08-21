import { useState, useEffect } from 'react';
import { auth } from '../../config/firebase';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Send, BarChart2, DollarSign, TrendingUp, TrendingDown, Clock, Activity 
} from 'lucide-react';
import { clsx } from 'clsx';

export const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/dashboard/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const GrowthBadge = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    return (
      <span className={clsx(
        "inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ml-1.5 sm:ml-2 whitespace-nowrap",
        isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      )}>
        {isPositive ? <TrendingUp size={10} className="sm:w-3 sm:h-3" /> : <TrendingDown size={10} className="sm:w-3 sm:h-3" />}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color, growth, subtitle }: any) => (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col relative overflow-hidden group hover:border-gray-200 transition-colors">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${color.replace('text-', 'bg-')}`} />
      
      <div className="flex justify-between items-start mb-2 sm:mb-4 relative">
        <h3 className="text-[10px] sm:text-sm font-semibold text-gray-500 tracking-wide uppercase truncate pr-2">{title}</h3>
        <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gray-50 ${color} flex-shrink-0`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
      
      <div className="relative">
        <div className="flex items-end flex-wrap gap-y-1">
          <span className="text-xl sm:text-3xl font-bold text-gray-900 leading-none">{value}</span>
          {growth !== undefined && <GrowthBadge value={growth} />}
        </div>
        {subtitle && (
          <p className="text-[10px] sm:text-sm text-gray-400 font-medium mt-1 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 p-3 sm:p-4 rounded-xl shadow-lg text-sm sm:text-base">
          <p className="font-semibold text-gray-900 mb-1 sm:mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs sm:text-sm mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-semibold text-gray-900">
                {entry.name === 'Revenue' ? '$' : ''}{entry.value.toFixed(entry.name === 'Revenue' ? 2 : 0)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-12 text-gray-500 bg-white rounded-xl border border-gray-100">
        Failed to load analytics data.
      </div>
    );
  }

  const { summary, graphData } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Activity className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" /> 
          Overview
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">Track your growth, revenue, and engagement.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard 
          title="Today's DMs" 
          value={summary.todayDMs} 
          icon={Send} 
          color="text-blue-500"
          growth={summary.dmsGrowth}
          subtitle={`Total Sent: ${summary.totalDMs}`}
        />
        <StatCard 
          title="Today's Views" 
          value={summary.todayViews} 
          icon={BarChart2} 
          color="text-emerald-500"
          growth={summary.viewsGrowth}
        />
        <StatCard 
          title="Today's Revenue" 
          value={`$${summary.todayRevenue.toFixed(2)}`} 
          icon={DollarSign} 
          color="text-purple-500"
          growth={summary.revenueGrowth}
          subtitle={`Total Earnings: $${summary.totalRevenue.toFixed(2)}`}
        />
        <StatCard 
          title="Pending Queue" 
          value={summary.activeQueues?.toString() || "0"} 
          icon={Clock} 
          color="text-amber-500"
        />
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Advanced Growth Analytics</h2>
          <p className="text-xs sm:text-sm text-gray-500">Trailing 14-day performance metrics</p>
        </div>
        
        <div className="h-[300px] sm:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDMs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={25} />
              <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Area yAxisId="left" type="monotone" dataKey="views" name="Page Views" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
              <Area yAxisId="left" type="monotone" dataKey="dms" name="DMs Sent" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorDMs)" />
              <Area yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
