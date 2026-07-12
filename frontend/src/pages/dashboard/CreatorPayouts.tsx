import { Loader, TableLoader } from '../../components/Loader';
import React, { useState, useEffect } from 'react';
import { DollarSign, History, CheckCircle, Wallet, FileText, Settings, X, AlertTriangle } from 'lucide-react';
import { auth } from '../../config/firebase';

interface Payout {
  id: string;
  amount: number;
  remarks: string;
  paidAt?: string;
  createdAt?: string;
}

interface PayoutDetails {
  upi?: { upiId: string; upiName: string };
  bank?: { accountNo: string; ifsc: string; holderName: string };
  defaultMethod?: 'upi' | 'bank';
}

interface PayoutInfo {
  subdomain: string;
  availableBalance: number;
  paidRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  payoutDetails: PayoutDetails | null;
  payouts: Payout[];
}

export const CreatorPayouts = () => {
  const [data, setData] = useState<PayoutInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'upi' | 'bank'>('upi');
  
  // Payout Settings State
  const [upiId, setUpiId] = useState('');
  const [upiName, setUpiName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [holderName, setHolderName] = useState('');
  const [defaultMethod, setDefaultMethod] = useState<'upi' | 'bank' | ''>('');
  
  const [submittingSettings, setSubmittingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  const fetchData = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/dashboard/payouts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        
        // Handle migration from old format to new format locally if needed
        let pd = json.payoutDetails;
        if (pd && pd.type) {
          // Old format
          pd = {
            defaultMethod: pd.type,
            ...(pd.type === 'upi' ? { upi: { upiId: pd.upiId } } : { bank: { accountNo: pd.accountNo, ifsc: pd.ifsc, holderName: pd.holderName } })
          };
        }
        json.payoutDetails = pd;
        setData(json);
        
        if (pd) {
          if (pd.upi) {
            setUpiId(pd.upi.upiId || '');
            setUpiName(pd.upi.upiName || '');
          }
          if (pd.bank) {
            setAccountNo(pd.bank.accountNo || '');
            setIfsc(pd.bank.ifsc || '');
            setHolderName(pd.bank.holderName || '');
          }
          if (pd.defaultMethod) {
            setActiveTab(pd.defaultMethod);
            setDefaultMethod(pd.defaultMethod);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch payouts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess(false);
    setSubmittingSettings(true);

    const pd = data?.payoutDetails || {};
    let newPd: any = { ...pd };

    if (!defaultMethod) {
      setSettingsError('You must select a default payment method.');
      setSubmittingSettings(false);
      return;
    }

    if (defaultMethod === 'upi' && (!upiId.trim() || !upiName.trim())) {
      setSettingsError('You must provide a valid UPI ID and Registered Name to set it as your default payment method.');
      setSubmittingSettings(false);
      return;
    }

    if (defaultMethod === 'bank' && (!accountNo.trim() || !ifsc.trim() || !holderName.trim())) {
      setSettingsError('You must provide complete Bank Transfer details to set it as your default payment method.');
      setSubmittingSettings(false);
      return;
    }

    if (upiId.trim() && upiName.trim()) {
      newPd.upi = { upiId: upiId.trim(), upiName: upiName.trim() };
    }
    if (accountNo.trim() && ifsc.trim() && holderName.trim()) {
      newPd.bank = { 
        accountNo: accountNo.trim(), 
        ifsc: ifsc.trim().toUpperCase(), 
        holderName: holderName.trim() 
      };
    }

    newPd.defaultMethod = defaultMethod;

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/dashboard/payout-setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payoutDetails: newPd })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save payout settings');
      }

      setSettingsSuccess(true);
      await fetchData();
      setTimeout(() => setShowModal(false), 1500);
    } catch (err: any) {
      setSettingsError(err.message);
    } finally {
      setSubmittingSettings(false);
    }
  };

  const SummaryCard = ({ title, value, icon: Icon }: { title: string, value: number, icon: any }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start justify-between">
      <div className="min-w-0 flex-1 pr-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 whitespace-nowrap truncate">{title}</h3>
        <span className="text-2xl lg:text-3xl font-black text-gray-900">${value.toFixed(2)}</span>
      </div>
      <div className="p-3 rounded-2xl bg-gray-50 text-gray-700">
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
          <p className="text-gray-500 mt-1">Track your earnings and configure your payment methods.</p>
        </div>
        <button
          onClick={() => {
            setSettingsSuccess(false);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-medium shadow-sm"
        >
          <Settings size={18} />
          Setup Payout
        </button>
      </div>

      {loading ? (
        <Loader text="Loading payout info..." />
      ) : !data ? (
        <div className="text-center p-12 text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
          Failed to load payout data. Ensure your account is fully approved and has a subdomain.
        </div>
      ) : (
        <>
          {!data.payoutDetails?.defaultMethod && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-red-900">Action Required: Setup Payout Details</h3>
                <p className="text-sm text-red-700 mt-1">
                  You have not configured a default payment method. We cannot process your monthly earnings until you click "Setup Payout" and save your details.
                </p>
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard title="This Month" value={data.thisMonthRevenue} icon={FileText} />
            <SummaryCard title="Last Month" value={data.lastMonthRevenue} icon={History} />
            <SummaryCard title="Available Balance" value={data.availableBalance} icon={Wallet} />
            <SummaryCard title="Total Paid" value={data.paidRevenue} icon={DollarSign} />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-full text-blue-700 mt-0.5">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-blue-900">Payout Schedule & Policies</h3>
              <ul className="text-sm text-blue-800 mt-2 space-y-1.5 list-disc list-inside">
                <li><strong>Monthly Rollover:</strong> On the 1st of every month, your total revenue from the previous month is added to your Available Balance.</li>
                <li><strong>Payout Window:</strong> Payouts are processed automatically between the <strong>1st and 10th</strong> of each month.</li>
                <li><strong>Minimum Threshold:</strong> Payouts are only issued if your Available Balance is <strong>greater than $15</strong>.</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-gray-500" />
                Payout History
              </h2>
              <p className="text-sm text-gray-500 mt-1">Automatic deposits made to your account.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-gray-100 text-gray-500 uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.payouts.length === 0 ? (
                    <TableLoader colSpan={4} text="No payouts have been processed yet." />
                  ) : data.payouts.map(payout => (
                    <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {new Date(payout.paidAt || payout.createdAt || '').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 font-black text-green-600">${payout.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle size={14} /> Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{payout.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Setup Payout Details</h2>
                <p className="text-sm text-gray-500 mt-1">Configure your preferred payment method</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveSettings} className="p-6 space-y-5">
              {settingsError && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                  {settingsError}
                </div>
              )}
              {settingsSuccess && (
                <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 flex items-center gap-2">
                  <CheckCircle size={16} /> Details saved! Closing...
                </div>
              )}

              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('upi')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'upi' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  UPI
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('bank')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'bank' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Bank Transfer
                </button>
              </div>

              {activeTab === 'upi' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registered Name</label>
                    <input
                      type="text"
                      value={upiName}
                      onChange={(e) => setUpiName(e.target.value)}
                      placeholder="Name linked to UPI"
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bank"
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={accountNo}
                      onChange={(e) => setAccountNo(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-900 mb-2">Select Default Payment Method</label>
                <p className="text-xs text-gray-500 mb-3">Which method should the Admin use to send your earnings?</p>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="defaultMethod"
                      value="upi"
                      checked={defaultMethod === 'upi'}
                      onChange={(e) => setDefaultMethod('upi')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-900">UPI</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="defaultMethod"
                      value="bank"
                      checked={defaultMethod === 'bank'}
                      onChange={(e) => setDefaultMethod('bank')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-900">Bank Transfer</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingSettings}
                className="w-full py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black font-medium transition-colors disabled:opacity-50"
              >
                {submittingSettings ? 'Saving...' : 'Save & Continue'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
