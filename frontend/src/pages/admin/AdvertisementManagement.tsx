import { Loader } from '../../components/Loader';
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Smartphone, Monitor } from 'lucide-react';
import { auth } from '../../config/firebase';

const PLACEMENTS = [
  'HEAD_START',
  'HEAD_END',
  'BODY_START',
  'BEFORE_HEADER',
  'AFTER_HEADER',
  'ARTICLE_TOP',
  'ARTICLE_MIDDLE',
  'ARTICLE_BOTTOM',
  'BEFORE_RELATED_POSTS',
  'SIDEBAR_TOP',
  'BEFORE_FOOTER',
  'BODY_END',
  'CTA_BUTTON'
];

export const AdvertisementManagement = () => {
  const [creators, setCreators] = useState<any[]>([]);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('');
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [currentAd, setCurrentAd] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    placement: 'HEAD_START',
    priority: 1,
    desktop: true,
    mobile: true,
    enabled: true,
    code: ''
  });

  const getHeaders = async () => {
    const token = await auth.currentUser?.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  useEffect(() => {
    if (selectedCreatorId) {
      fetchAds(selectedCreatorId);
    } else {
      setAds([]);
    }
  }, [selectedCreatorId]);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const headers = await getHeaders();
      const res = await fetch('/api/admin/creators', { headers });
      if (res.ok) {
        const data = await res.json();
        setCreators(data);
        if (data.length > 0) {
          setSelectedCreatorId(data[0].uid);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAds = async (creatorId: string) => {
    try {
      setLoading(true);
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/ads?creatorId=${creatorId}`, { headers });
      if (res.ok) {
        setAds(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openForm = (ad?: any) => {
    if (ad) {
      setCurrentAd(ad);
      setFormData({
        name: ad.name,
        provider: ad.provider,
        placement: ad.placement,
        priority: ad.priority,
        desktop: ad.desktop,
        mobile: ad.mobile,
        enabled: ad.enabled,
        code: ad.code
      });
    } else {
      setCurrentAd(null);
      setFormData({
        name: '',
        provider: '',
        placement: 'HEAD_START',
        priority: 1,
        desktop: true,
        mobile: true,
        enabled: true,
        code: ''
      });
    }
    setIsEditing(true);
  };

  const closeForm = () => {
    setIsEditing(false);
    setCurrentAd(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreatorId) return;

    try {
      const headers = await getHeaders();
      const payload = { ...formData, creatorId: selectedCreatorId };

      let res;
      if (currentAd) {
        res = await fetch(`/api/admin/ads/${currentAd.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`/api/admin/ads`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        fetchAds(selectedCreatorId);
        closeForm();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save advertisement');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return;
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/ads/${id}?creatorId=${selectedCreatorId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        fetchAds(selectedCreatorId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (ad: any) => {
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/ads/${ad.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ creatorId: selectedCreatorId, enabled: !ad.enabled })
      });
      if (res.ok) {
        fetchAds(selectedCreatorId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && creators.length === 0) {
    return <Loader text="Loading Configuration..." />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advertisement Management</h1>
          <p className="text-gray-500 mt-1">Configure and manage ad codes per tenant (creator).</p>
        </div>
      </div>

      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
        <label className="font-medium text-gray-700">Select Creator/Subdomain:</label>
        <select
          value={selectedCreatorId}
          onChange={(e) => setSelectedCreatorId(e.target.value)}
          className="flex-1 max-w-md border border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none"
        >
          {creators.map(creator => (
            <option key={creator.uid} value={creator.uid}>
              {creator.subdomain}.domain.com ({creator.fullName})
            </option>
          ))}
        </select>
        <button
          onClick={() => openForm()}
          disabled={!selectedCreatorId}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
        >
          <Plus size={18} /> Add New Ad
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && ads.length === 0 ? (
          <Loader text="Loading ads..." />
        ) : ads.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Advertisements Found</h3>
            <p className="text-gray-500">This tenant does not have any active ad configurations.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Provider</th>
                  <th className="px-6 py-4 font-medium">Placement</th>
                  <th className="px-6 py-4 font-medium">Priority</th>
                  <th className="px-6 py-4 font-medium">Devices</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ads.map(ad => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{ad.name}</td>
                    <td className="px-6 py-4 text-gray-600">{ad.provider}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{ad.placement}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{ad.priority}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 text-gray-400">
                        {ad.desktop ? <Monitor size={16} className="text-blue-500" /> : <Monitor size={16} />}
                        {ad.mobile ? <Smartphone size={16} className="text-blue-500" /> : <Smartphone size={16} />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(ad)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          ad.enabled ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {ad.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openForm(ad)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Form Overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">{currentAd ? 'Edit Ad Code' : 'Add New Ad Code'}</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 flex-1 flex flex-col gap-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleFormChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. Sidebar Sticky Banner" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <input required type="text" name="provider" value={formData.provider} onChange={handleFormChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. Adsterra, Google AdSense, Media.net" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
                <select required name="placement" value={formData.placement} onChange={handleFormChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                  {PLACEMENTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <input required type="number" name="priority" min="1" value={formData.priority} onChange={handleFormChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                <p className="text-xs text-gray-500 mt-1">Lower number renders first.</p>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="desktop" checked={formData.desktop} onChange={handleFormChange} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Desktop</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="mobile" checked={formData.mobile} onChange={handleFormChange} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Mobile</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="enabled" checked={formData.enabled} onChange={handleFormChange} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Enabled</span>
                </label>
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Code (HTML/JS)</label>
                <textarea required name="code" value={formData.code} onChange={handleFormChange} className="w-full flex-1 min-h-[250px] p-3 border border-gray-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-purple-500 outline-none resize-none bg-gray-50" placeholder="Paste the original script exactly as provided by the ad network..."></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={closeForm} className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 px-4 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex justify-center items-center gap-2">
                  <Save size={18} /> Save Ad
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
