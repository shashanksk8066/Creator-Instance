import { Loader } from '../../components/Loader';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Settings, Play, Pause, Trash2, Edit } from 'lucide-react';
import { auth } from '../../config/firebase';

export const AutoDmRules = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Record<string, string>>({});
  const [blogs, setBlogs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [rulesRes, accountsRes, blogsRes] = await Promise.all([
        fetch('/api/auto-dm/rules', { headers }),
        fetch('/api/instagram/accounts', { headers }),
        fetch('/api/blogs', { headers })
      ]);
      
      if (rulesRes.ok) {
        setRules(await rulesRes.json());
      }
      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        const accountsMap: Record<string, string> = {};
        Object.values(accountsData).forEach((acc: any) => {
          accountsMap[acc.accountId] = acc.username;
        });
        setAccounts(accountsMap);
      }
      if (blogsRes.ok) {
        const blogsData = await blogsRes.json();
        const blogsMap: Record<string, string> = {};
        blogsData.forEach((blog: any) => {
          blogsMap[blog.id] = blog.title;
        });
        setBlogs(blogsMap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleStatus = async (rule: any) => {
    const newStatus = rule.status === 'active' ? 'disabled' : 'active';
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`/api/auto-dm/rules/${rule.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`/api/auto-dm/rules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <Loader text="Loading rules..." />;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auto DM Rules</h1>
          <p className="text-gray-500 mt-1">Manage your automated Instagram replies.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard/auto-dm"
            className="text-gray-500 hover:text-gray-700 font-medium text-sm flex items-center gap-1"
          >
            <Settings size={16} /> Connection Settings
          </Link>
          <Link
            to="/dashboard/auto-dm/rules/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <Plus size={18} /> Create Rule
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {rules.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rules yet</h3>
            <p className="text-gray-500 mb-6">Create your first rule to start automating DMs.</p>
            <Link
              to="/dashboard/auto-dm/rules/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              <Plus size={18} /> Create Rule
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <tr>
                  <th className="px-6 py-4 font-medium">Account</th>
                  <th className="px-6 py-4 font-medium">Trigger</th>
                  <th className="px-6 py-4 font-medium">Posts Selected</th>
                  <th className="px-6 py-4 font-medium">Linked Blog</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        @{accounts[rule.accountId] || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {rule.triggerType === 'any' ? (
                        <span className="inline-flex px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium">Any Comment</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {rule.keywords?.slice(0, 3).map((k: string) => (
                            <span key={k} className="inline-flex px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium">"{k}"</span>
                          ))}
                          {rule.keywords?.length > 3 && (
                            <span className="inline-flex px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-medium">+{rule.keywords.length - 3}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {rule.selectedPosts?.length} Post{rule.selectedPosts?.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-medium truncate max-w-[150px] inline-block" title={blogs[rule.blogId] || rule.blogId}>
                        {blogs[rule.blogId] || rule.blogId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        rule.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {rule.status === 'active' ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleStatus(rule)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-200 transition-colors"
                          title={rule.status === 'active' ? 'Disable' : 'Enable'}
                        >
                          {rule.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <Link 
                          to={`/dashboard/auto-dm/rules/${rule.id}`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => deleteRule(rule.id)}
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
    </div>
  );
};
