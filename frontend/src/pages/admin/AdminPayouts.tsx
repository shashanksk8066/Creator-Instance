import React, { useState, useEffect } from 'react';
import { Wallet, Search, CheckCircle, Clock } from 'lucide-react';
import { auth } from '../../config/firebase';

interface SubdomainPayoutInfo {
  subdomain: string;
  creatorId: string;
  availableBalance: number;
  paidRevenue: number;
  payoutDetails: {
    upi?: { upiId: string; upiName: string };
    bank?: { accountNo: string; ifsc: string; holderName: string };
    defaultMethod?: 'upi' | 'bank';
  } | null;
}

export const AdminPayouts = () => {
  const [subdomains, setSubdomains] = useState<SubdomainPayoutInfo[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterMin15, setFilterMin15] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedSubdomain, setSelectedSubdomain] = useState<SubdomainPayoutInfo | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payRemarks, setPayRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const fetchPayouts = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/payouts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        const mapped = json.map((sub: any) => {
          let pd = sub.payoutDetails;
          if (pd && pd.type) {
             pd = {
               defaultMethod: pd.type,
               ...(pd.type === 'upi' ? { upi: { upiId: pd.upiId, upiName: pd.upiName || 'Unknown' } } : { bank: { accountNo: pd.accountNo, ifsc: pd.ifsc, holderName: pd.holderName } })
             };
          }
          return { ...sub, payoutDetails: pd };
        });
        setSubdomains(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch payouts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubdomain) return;
    
    if (Number(payAmount) <= 0 || Number(payAmount) > selectedSubdomain.availableBalance) {
      setError(`Amount must be between $0.01 and $${selectedSubdomain.availableBalance.toFixed(2)}`);
      return;
    }

    if (!window.confirm(`Are you sure you want to mark $${payAmount} as paid for ${selectedSubdomain.subdomain}? This action cannot be undone.`)) {
      return;
    }

    setProcessing(true);
    setError('');
    
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/admin/payouts/${selectedSubdomain.subdomain}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: Number(payAmount), remarks: payRemarks })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to process payout');
      }

      await fetchPayouts();
      setSelectedSubdomain(null);
      setPayAmount('');
      setPayRemarks('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const filteredSubdomains = subdomains.filter(sub => {
    const matchesSearch = sub.subdomain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterMin15 ? sub.availableBalance >= 15 : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Creator Payouts</h1>
          <p className="text-gray-500 mt-1">Manage and execute payouts for creators.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={filterMin15}
              onChange={(e) => setFilterMin15(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            Balance &ge; $15
          </label>
          
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search subdomain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gray-500" />
            Subdomain Balances
          </h2>
          <span className="text-sm font-medium text-gray-500">
            {filteredSubdomains.length} {filteredSubdomains.length === 1 ? 'Creator' : 'Creators'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Subdomain</th>
                <th className="px-6 py-4 font-semibold">Available Balance</th>
                <th className="px-6 py-4 font-semibold">Total Paid</th>
                <th className="px-6 py-4 font-semibold">Default Method</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center p-8 text-gray-500">Loading...</td></tr>
              ) : filteredSubdomains.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-8 text-gray-500">No creators found matching criteria.</td></tr>
              ) : filteredSubdomains.map(sub => (
                <tr key={sub.subdomain} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{sub.subdomain}</td>
                  <td className="px-6 py-4 font-bold text-green-600">${sub.availableBalance.toFixed(2)}</td>
                  <td className="px-6 py-4 font-semibold text-blue-600">${sub.paidRevenue.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    {sub.payoutDetails && sub.payoutDetails.defaultMethod ? (
                      <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded font-medium text-xs">
                        <CheckCircle size={14} /> {sub.payoutDetails.defaultMethod === 'upi' ? 'UPI Setup' : 'Bank Setup'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 border border-gray-200 px-2 py-1 rounded font-medium text-xs">
                        <Clock size={14} /> Not Configured
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedSubdomain(sub);
                        setPayAmount(sub.availableBalance.toString());
                        setPayRemarks('');
                      }}
                      disabled={sub.availableBalance <= 0 || !sub.payoutDetails?.defaultMethod}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm shadow-sm"
                    >
                      Pay Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Modal */}
      {selectedSubdomain && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Execute Payout</h2>
              <p className="text-sm text-gray-500 mt-1">Paying <span className="font-semibold text-gray-900">{selectedSubdomain.subdomain}</span></p>
            </div>
            
            <form onSubmit={handlePay} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-2">
                <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Payment Details</h3>
                {selectedSubdomain.payoutDetails?.defaultMethod === 'upi' && selectedSubdomain.payoutDetails.upi ? (
                  <div className="text-sm font-medium text-blue-900 space-y-1">
                    <p>Name: {selectedSubdomain.payoutDetails.upi.upiName}</p>
                    <p>UPI ID: <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">{selectedSubdomain.payoutDetails.upi.upiId}</span></p>
                  </div>
                ) : selectedSubdomain.payoutDetails?.bank ? (
                  <div className="text-sm font-medium text-blue-900 space-y-1">
                    <p>Holder: {selectedSubdomain.payoutDetails.bank.holderName}</p>
                    <p>Account: <span className="font-mono">{selectedSubdomain.payoutDetails.bank.accountNo}</span></p>
                    <p>IFSC: <span className="font-mono uppercase">{selectedSubdomain.payoutDetails.bank.ifsc}</span></p>
                  </div>
                ) : <p className="text-sm text-red-600">Error reading payment method.</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Pay ($)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.01"
                    max={selectedSubdomain.availableBalance}
                    step="0.01"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPayAmount(selectedSubdomain.availableBalance.toString())}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors border border-gray-200"
                  >
                    Max
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Available: ${selectedSubdomain.availableBalance.toFixed(2)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                <input
                  type="text"
                  value={payRemarks}
                  onChange={(e) => setPayRemarks(e.target.value)}
                  placeholder="e.g. July Payout, Ref #1234"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSubdomain(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium border border-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50 transition-colors font-medium shadow-md"
                >
                  {processing ? 'Processing...' : 'Mark as Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
