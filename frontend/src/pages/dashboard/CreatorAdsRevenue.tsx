import { Loader, TableLoader } from '../../components/Loader';
import React, { useState, useEffect } from 'react';
import { DollarSign, MousePointerClick, Eye, Activity } from 'lucide-react';
import { auth } from '../../config/firebase';

interface DailyStats {
  date: string;
  revenue: number;
  clicks: number;
  impressions: number;
}

interface RevenueData {
  subdomain: string;
  totalRevenue: number;
  totalClicks: number;
  totalImpressions: number;
  lastRevenueSync: string | null;
  dailyStats: DailyStats[];
}

export const CreatorAdsRevenue = () => {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  const [todayTotals, setTodayTotals] = useState({ revenue: 0, clicks: 0, impressions: 0 });
  const [yesterdayTotals, setYesterdayTotals] = useState({ revenue: 0, clicks: 0, impressions: 0 });
  const [monthTotals, setMonthTotals] = useState({ revenue: 0, clicks: 0, impressions: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/dashboard/revenue', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const revenueData: RevenueData = await res.json();
          setData(revenueData);
          
          const todayStr = new Date().toISOString().split('T')[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          const currentMonthPrefix = todayStr.substring(0, 7);

          let tRev = 0, tClicks = 0, tImp = 0;
          let yRev = 0, yClicks = 0, yImp = 0;
          let mRev = 0, mClicks = 0, mImp = 0;

          revenueData.dailyStats.forEach(stat => {
            if (stat.date === todayStr) {
              tRev += stat.revenue || 0;
              tClicks += stat.clicks || 0;
              tImp += stat.impressions || 0;
            }
            if (stat.date === yesterdayStr) {
              yRev += stat.revenue || 0;
              yClicks += stat.clicks || 0;
              yImp += stat.impressions || 0;
            }
            if (stat.date.startsWith(currentMonthPrefix)) {
              mRev += stat.revenue || 0;
              mClicks += stat.clicks || 0;
              mImp += stat.impressions || 0;
            }
          });
          
          setTodayTotals({ revenue: tRev, clicks: tClicks, impressions: tImp });
          setYesterdayTotals({ revenue: yRev, clicks: yClicks, impressions: yImp });
          setMonthTotals({ revenue: mRev, clicks: mClicks, impressions: mImp });
        }
      } catch (error) {
        console.error('Failed to fetch revenue', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const SummaryCard = ({ title, dataObj }: { title: string, dataObj: typeof todayTotals }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{title}</h3>
      <div className="flex justify-between items-end">
        <div>
          <div className="mb-2">
            <span className="text-2xl font-black text-gray-900">${(dataObj.revenue || 0).toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
            <div className="flex items-center gap-1.5">
              <MousePointerClick className="w-4 h-4 text-gray-400" />
              <span>{dataObj.clicks}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-gray-400" />
              <span>{dataObj.impressions}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ads Revenue</h1>
          <p className="text-gray-500 mt-1">Track your daily ad earnings and performance.</p>
        </div>
        {data?.lastRevenueSync && (
          <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
            Last Synced: <span className="font-medium text-gray-700">{new Date(data.lastRevenueSync).toLocaleString()}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center p-12 text-gray-500 flex flex-col items-center gap-4">
          <Activity className="animate-spin text-purple-500 w-8 h-8" />
          Loading revenue data...
        </div>
      ) : !data ? (
        <div className="text-center p-12 text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
          No revenue data found for your account.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <SummaryCard title="Today" dataObj={todayTotals} />
            <SummaryCard title="Yesterday" dataObj={yesterdayTotals} />
            <SummaryCard title="This Month" dataObj={monthTotals} />
            <SummaryCard 
              title="All Time (Total)" 
              dataObj={{ revenue: data.totalRevenue, clicks: data.totalClicks, impressions: data.totalImpressions }} 
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity size={20} className="text-gray-500" />
                Day-by-Day Breakdown
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Revenue</th>
                    <th className="px-6 py-4 font-semibold">Clicks</th>
                    <th className="px-6 py-4 font-semibold">Impressions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(!data.dailyStats || data.dailyStats.length === 0) ? (
                    <TableLoader colSpan={4} text="
                        No daily stats available yet.
                      " />
                  ) : data.dailyStats.map(stat => (
                    <tr key={stat.date} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{stat.date}</td>
                      <td className="px-6 py-4 text-gray-900 font-bold">${(stat.revenue || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{stat.clicks}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{stat.impressions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
