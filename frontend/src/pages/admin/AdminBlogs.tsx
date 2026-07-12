import { Loader, TableLoader } from '../../components/Loader';
import { useState, useEffect } from 'react';
import { auth } from '../../config/firebase';
import { BookOpen, Search, Eye, Trash2, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';

export const AdminBlogs = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/admin/blogs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        let data = await response.json();
        // Sort: unreviewed at the top
        data.sort((a: any, b: any) => {
          if (a.adminReviewed === b.adminReviewed) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return a.adminReviewed ? 1 : -1;
        });
        setBlogs(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, currentlyReviewed: boolean) => {
    setUpdatingId(id);
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`/api/admin/blogs/${id}/review`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reviewed: !currentlyReviewed })
      });
      await fetchBlogs();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this blog? This action cannot be undone.")) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchBlogs();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredBlogs = blogs.filter(b => {
    const q = searchQuery.toLowerCase();
    return (
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.authorName && b.authorName.toLowerCase().includes(q)) ||
      (b.subdomain && b.subdomain.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen size={28} className="text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">All Published Blogs</h2>
        </div>
        
        <div className="relative w-72">
          <input 
            type="text" 
            placeholder="Search blogs, authors..." 
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
                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-sm w-1/3">Blog Title</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Creator Info</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Views</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <TableLoader colSpan={5} text="Loading blogs..." />
              ) : filteredBlogs.length === 0 ? (
                <TableLoader colSpan={5} text="No published blogs found." />
              ) : (
                filteredBlogs.map(blog => (
                  <tr key={blog.id} className={`hover:bg-gray-50 transition-colors ${!blog.adminReviewed ? 'bg-orange-50/30' : ''}`}>
                    <td className="p-4">
                      {blog.adminReviewed ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full w-fit">
                          <CheckCircle size={14} /> Reviewed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full w-fit">
                          <AlertCircle size={14} /> Needs Review
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900 line-clamp-2">{blog.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(blog.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-800 text-sm">{blog.authorName}</p>
                      <p className="text-blue-600 font-mono text-xs mt-0.5">{blog.subdomain}.{import.meta.env.VITE_BASE_DOMAIN || 'creatoros.com'}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-600 font-medium text-sm">{blog.views?.toLocaleString() || 0}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleReview(blog.id, blog.adminReviewed)}
                          disabled={updatingId === blog.id}
                          className={`p-1.5 rounded transition-colors flex items-center justify-center border disabled:opacity-50 disabled:cursor-not-allowed ${
                            blog.adminReviewed 
                              ? 'text-gray-600 hover:bg-gray-100 border-gray-300' 
                              : 'text-white bg-purple-600 hover:bg-purple-700 border-purple-600 px-3'
                          }`}
                          title={blog.adminReviewed ? "Mark as Unreviewed" : "Mark as Reviewed"}
                        >
                          {updatingId === blog.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <>
                              {blog.adminReviewed ? <X size={16} /> : <span className="text-xs font-medium mr-1">Mark Reviewed</span>}
                              {!blog.adminReviewed && <CheckCircle size={14} />}
                            </>
                          )}
                        </button>

                        <a 
                          href={`http://${blog.subdomain}.${import.meta.env.VITE_BASE_DOMAIN || 'creatoros.com'}/blogs/${blog.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View Blog"
                        >
                          <Eye size={18} />
                        </a>
                        <button 
                          onClick={() => handleDelete(blog.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Blog"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
