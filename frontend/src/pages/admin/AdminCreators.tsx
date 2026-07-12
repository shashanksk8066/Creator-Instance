import { Loader, TableLoader } from '../../components/Loader';
import { useState, useEffect } from 'react';
import { auth } from '../../config/firebase';
import { Users, Search, ChevronRight, X, AlertTriangle, Trash2 } from 'lucide-react';

export const AdminCreators = () => {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [creatorDetails, setCreatorDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/admin/creators/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCreators(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (uid: string) => {
    setSelectedCreatorId(uid);
    setDetailsLoading(true);
    setCreatorDetails(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`/api/admin/creators/${uid}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCreatorDetails(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleStatusChange = async (uid: string, action: 'approve' | 'reject' | 'pending') => {
    if (!window.confirm(`Are you sure you want to change this creator's status to ${action.toUpperCase()}?`)) {
      return;
    }
    try {
      setActionLoading(true);
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`/api/admin/creators/${uid}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert(`Status updated to ${action}`);
        await fetchCreators();
        setSelectedCreatorId(null);
      } else {
        const err = await response.json();
        alert(`Failed to update status: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCreator = async (uid: string) => {
    if (!window.confirm('Are you absolutely sure you want to completely delete this creator? This will wipe out all their blogs, DMs, payouts, and free up their subdomain. This action CANNOT be undone.')) {
      return;
    }
    try {
      setActionLoading(true);
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`/api/admin/creators/${uid}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Creator deleted successfully.');
        await fetchCreators();
        setSelectedCreatorId(null);
      } else {
        const err = await response.json();
        alert(`Failed to delete creator: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCreators = creators.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      (c.fullName && c.fullName.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.subdomain && c.subdomain.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={28} className="text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">All Creators</h2>
        </div>
        
        <div className="relative w-72">
          <input 
            type="text" 
            placeholder="Search by name, email or subdomain..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          />
          <Search size={18} className="text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-600 text-sm">Name</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Email</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Subdomain</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Category</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-sm w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <TableLoader colSpan={5} text="Loading creators..." />
              ) : filteredCreators.length === 0 ? (
                <TableLoader colSpan={5} text="No creators found." />
              ) : (
                filteredCreators.map(creator => (
                  <tr 
                    key={creator.uid} 
                    onClick={() => handleRowClick(creator.uid)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{creator.fullName}</p>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{creator.email}</td>
                    <td className="p-4">
                      <span className="text-blue-600 font-mono text-sm bg-blue-50 px-2 py-1 rounded-md">
                        {creator.subdomain}.{import.meta.env.VITE_BASE_DOMAIN || 'creatoros.com'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600 border border-gray-200">
                        {creator.creatorCategory || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        creator.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                        creator.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {creator.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <ChevronRight size={18} className="text-gray-400 group-hover:text-purple-600" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedCreatorId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">Creator Details</h3>
              <button 
                onClick={() => setSelectedCreatorId(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {detailsLoading ? (
                <Loader text="Loading details..." />
              ) : creatorDetails ? (
                <>
                  {/* Personal Details */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Personal Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</p>
                        <p className="text-gray-900 font-medium">{creatorDetails.profile.fullName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                        <p className="text-gray-900">{creatorDetails.profile.email}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mobile</p>
                        <p className="text-gray-900">{creatorDetails.profile.mobileNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Category</p>
                        <p className="text-gray-900">{creatorDetails.profile.creatorCategory || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Followers</p>
                        <p className="text-gray-900">{creatorDetails.profile.followersCount?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Domain</p>
                        <p className="text-blue-600 font-mono text-sm">{creatorDetails.profile.subdomain}.{import.meta.env.VITE_BASE_DOMAIN || 'creatoros.com'}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Instagram Link</p>
                      <a href={creatorDetails.profile.socialPageLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                        {creatorDetails.profile.socialPageLink || 'N/A'}
                      </a>
                    </div>
                  </div>

                  {/* Connected Instagram Accounts */}
                  {creatorDetails.profile.instagramAccounts && Object.keys(creatorDetails.profile.instagramAccounts).length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Connected Instagram Accounts</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.values(creatorDetails.profile.instagramAccounts).map((acc: any) => (
                          <div key={acc.accountId} className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                  {acc.username.charAt(0).toUpperCase()}
                               </div>
                               <div>
                                 <p className="font-bold text-gray-900">@{acc.username}</p>
                                 <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                   Connected
                                 </p>
                               </div>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blog, DM & Revenue Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-8">
                      <div>
                        <h4 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Blog Stats</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-blue-600 mb-1">Total Posts</p>
                            <p className="text-2xl font-bold text-blue-900">{creatorDetails.blogStats.totalBlogs}</p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-purple-600 mb-1">Total Views</p>
                            <p className="text-2xl font-bold text-purple-900">{creatorDetails.blogStats.totalBlogViews.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Auto DM Stats</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-indigo-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-indigo-600 mb-1">Total Sent</p>
                            <p className="text-2xl font-bold text-indigo-900">{creatorDetails.dmStats.totalDMs.toLocaleString()}</p>
                          </div>
                          <div className="bg-pink-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-pink-600 mb-1">Sent Today</p>
                            <p className="text-2xl font-bold text-pink-900">{creatorDetails.dmStats.todayDMs.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Revenue Details</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-emerald-50 p-4 rounded-lg">
                          <p className="text-xs font-medium text-emerald-600 mb-1">Earned</p>
                          <p className="text-xl font-bold text-emerald-900">${creatorDetails.revenueData.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg">
                          <p className="text-xs font-medium text-gray-600 mb-1">Paid Out</p>
                          <p className="text-xl font-bold text-gray-900">${creatorDetails.revenueData.totalWithdrawn.toLocaleString()}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <p className="text-xs font-medium text-orange-600 mb-1">Available Balance</p>
                          <p className="text-xl font-bold text-orange-900">${creatorDetails.revenueData.availableBalance.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payout History */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Payout Request History</h4>
                    {creatorDetails.payouts.length === 0 ? (
                      <p className="text-gray-500 text-sm">No payout requests found for this creator.</p>
                    ) : (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="p-3 font-semibold text-gray-600">Date</th>
                              <th className="p-3 font-semibold text-gray-600">Amount</th>
                              <th className="p-3 font-semibold text-gray-600">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {creatorDetails.payouts.map((p: any) => (
                              <tr key={p.id}>
                                <td className="p-3 text-gray-600">{new Date(p.createdAt).toLocaleDateString()}</td>
                                <td className="p-3 font-medium text-gray-900">${p.amount}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    p.status === 'paid' ? 'bg-green-100 text-green-700' :
                                    p.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {p.status.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  
                  {/* Danger Zone */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                      <AlertTriangle size={20} />
                      Danger Zone & Management
                    </h4>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-red-50 p-5 rounded-lg border border-red-100">
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Status Management</p>
                        <p className="text-sm text-gray-600">Change the creator's platform access status.</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleStatusChange(creatorDetails.profile.uid, 'pending')}
                          disabled={actionLoading || creatorDetails.profile.status === 'Pending'}
                          className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 disabled:opacity-50"
                        >
                          Set Pending
                        </button>
                        <button 
                          onClick={() => handleStatusChange(creatorDetails.profile.uid, 'reject')}
                          disabled={actionLoading || creatorDetails.profile.status === 'Rejected'}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleStatusChange(creatorDetails.profile.uid, 'approve')}
                          disabled={actionLoading || creatorDetails.profile.status === 'Approved'}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 disabled:opacity-50"
                        >
                          Approve
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-red-50 p-5 rounded-lg border border-red-100 mt-4">
                      <div>
                        <p className="font-semibold text-red-700 mb-1">Delete Creator Account</p>
                        <p className="text-sm text-red-600/80">Permanently delete this user, all their blogs, DM rules, logs, and free up their subdomain.</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteCreator(creatorDetails.profile.uid)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        Delete Creator
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-red-500">Failed to load details.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
