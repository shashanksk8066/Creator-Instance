import { Loader, TableLoader } from '../../components/Loader';
import React, { useState, useEffect } from 'react';
import { DollarSign, MousePointerClick, Eye, RefreshCw, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { auth } from '../../config/firebase';

interface SubdomainStats {
  id: string;
  totalRevenue: number;
  paidRevenue?: number;
  totalClicks: number;
  totalImpressions: number;
  availableBalance?: number;
  lastRevenueSync?: string;
}

interface DailyStats {
  date: string;
  revenue: number;
  clicks: number;
  impressions: number;
}

export const AdsRevenue = () => {
  const [subdomains, setSubdomains] = useState<SubdomainStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [dailyStats, setDailyStats] = useState<Record<string, DailyStats[]>>({});

  const [todayTotals, setTodayTotals] = useState({ revenue: 0, clicks: 0, impressions: 0 });
  const [yesterdayTotals, setYesterdayTotals] = useState({ revenue: 0, clicks: 0, impressions: 0 });
  const [monthTotals, setMonthTotals] = useState({ revenue: 0, clicks: 0, impressions: 0 });
  
  const [platformPaid, setPlatformPaid] = useState(0);
  const [platformUnpaid, setPlatformUnpaid] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      
      const res = await fetch('/api/admin/ads/revenue', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setSubdomains(data);
        
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const currentMonthPrefix = todayStr.substring(0, 7);

        let tRev = 0, tClicks = 0, tImp = 0;
        let yRev = 0, yClicks = 0, yImp = 0;
        let mRev = 0, mClicks = 0, mImp = 0;
        let totalPaidSum = 0;
        let totalUnpaidSum = 0;

        for (const sub of data) {
          const sPaidRev = sub.paidRevenue || 0;
          const sAvailable = sub.availableBalance || 0;
          totalPaidSum += sPaidRev;
          totalUnpaidSum += sAvailable;
          const statsRes = await fetch(`/api/admin/ads/revenue/${sub.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (statsRes.ok) {
            const stats: DailyStats[] = await statsRes.json();
            setDailyStats(prev => ({ ...prev, [sub.id]: stats }));
            
            stats.forEach(stat => {
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
          }
        }
        
        setTodayTotals({ revenue: tRev, clicks: tClicks, impressions: tImp });
        setYesterdayTotals({ revenue: yRev, clicks: yClicks, impressions: yImp });
        setMonthTotals({ revenue: mRev, clicks: mClicks, impressions: mImp });
        setPlatformPaid(totalPaidSum);
        setPlatformUnpaid(totalUnpaidSum);
      }
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/ads/revenue/sync', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to sync');
      }
      alert('Synced successfully');
      await fetchData();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSyncing(false);
    }
  };

  const toggleRow = async (subdomainId: string) => {
    if (expandedRow === subdomainId) {
      setExpandedRow(null);
      return;
    }
    setExpandedRow(subdomainId);
  };

  const SummaryCard = ({ title, data }: { title: string, data: Partial<typeof todayTotals> }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{title}</h3>
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-green-500 w-5 h-5" />
            <span className="text-2xl font-bold text-gray-900">${(data.revenue || 0).toFixed(2)}</span>
          </div>
          {data.clicks !== undefined && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MousePointerClick className="w-4 h-4 text-blue-500" />
                <span>{data.clicks}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-purple-500" />
                <span>{data.impressions}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ads Revenue</h1>
          <p className="text-gray-500 mt-1">Monitor 50% shared publisher revenue across all subdomains.</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing || loading}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium"
        >
          <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync Adsterra Data'}
        </button>
      </div>

      {loading ? (
        <Loader text="Loading revenue data..." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <SummaryCard title="Today's Rev" data={todayTotals} />
            <SummaryCard title="Yesterday's Rev" data={yesterdayTotals} />
            <SummaryCard title="This Month" data={monthTotals} />
            <SummaryCard title="Total Paid" data={{ revenue: platformPaid }} />
            <SummaryCard title="Total Unpaid" data={{ revenue: platformUnpaid }} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-700">Subdomain</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Total Revenue</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Total Clicks</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Total Impressions</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Last Synced</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subdomains.length === 0 ? (
                    <TableLoader colSpan={6} text="
                        No revenue data found. Click Sync to fetch from Adsterra.
                      " />
                  ) : subdomains.map(sub => (
                    <React.Fragment key={sub.id}>
                      <tr 
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${expandedRow === sub.id ? 'bg-blue-50/30' : ''}`}
                        onClick={() => toggleRow(sub.id)}
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">{sub.id}</td>
                        <td className="px-6 py-4 text-green-600 font-semibold">${(sub.totalRevenue || 0).toFixed(2)}</td>
                        <td className="px-6 py-4">{sub.totalClicks || 0}</td>
                        <td className="px-6 py-4">{sub.totalImpressions || 0}</td>
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {sub.lastRevenueSync ? new Date(sub.lastRevenueSync).toLocaleString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {expandedRow === sub.id ? <ChevronDown className="inline text-gray-400" /> : <ChevronRight className="inline text-gray-400" />}
                        </td>
                      </tr>
                      
                      {expandedRow === sub.id && (
                        <tr>
                          <td colSpan={6} className="px-0 py-0 bg-gray-50 border-b border-gray-200 shadow-inner">
                            <div className="p-6">
                              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
                                <Activity size={16} className="text-blue-500" />
                                Day-by-Day Breakdown (IST)
                              </h4>
                              
                              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                                    <tr>
                                      <th className="px-4 py-3 text-left font-medium">Date</th>
                                      <th className="px-4 py-3 text-left font-medium">Revenue (50%)</th>
                                      <th className="px-4 py-3 text-left font-medium">Clicks</th>
                                      <th className="px-4 py-3 text-left font-medium">Impressions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {(!dailyStats[sub.id] || dailyStats[sub.id].length === 0) ? (
                                      <TableLoader colSpan={4} text="No daily stats available." />
                                    ) : dailyStats[sub.id].map(stat => (
                                      <tr key={stat.date} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-700">{stat.date}</td>
                                        <td className="px-4 py-3 text-green-600 font-semibold">${(stat.revenue || 0).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-gray-600">{stat.clicks}</td>
                                        <td className="px-4 py-3 text-gray-600">{stat.impressions}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
