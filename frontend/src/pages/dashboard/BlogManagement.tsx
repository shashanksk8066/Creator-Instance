import { Loader, TableLoader } from '../../components/Loader';
import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { Plus, Edit2, Trash2, Eye, Copy, CheckCircle, Clock, BarChart2 } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

export const BlogManagement = () => {
  const { profile } = useOutletContext<{ profile: any }>();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/blogs', { headers: { 'Authorization': `Bearer ${token}` } });
      setBlogs(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchBlogs();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchBlogs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async (blog: any) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const duplicateData = {
        ...blog,
        title: `${blog.title} (Copy)`,
        status: 'Draft',
        slug: undefined // will trigger auto-slug
      };
      
      await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData)
      });
      fetchBlogs();
    } catch (err) {
      console.error(err);
    }
  };

  const publishedCount = blogs.filter(b => b.status === 'Published').length;
  const draftCount = blogs.filter(b => b.status === 'Draft').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Blog Management</h2>
        <Link 
          to="/dashboard/blogs/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors w-full sm:w-auto shadow-sm"
        >
          <Plus size={18} /> Create New Blog
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        <Card className="p-4 sm:p-6 flex flex-col justify-center">
          <p className="text-[11px] sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Total Blogs</p>
          <h3 className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{blogs.length}</h3>
        </Card>
        <Card className="p-4 sm:p-6 flex flex-col justify-center">
          <p className="text-[11px] sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Published</p>
          <h3 className="text-xl sm:text-3xl font-bold text-green-600 mt-1 sm:mt-2">{publishedCount}</h3>
        </Card>
        <Card className="p-4 sm:p-6 flex flex-col justify-center">
          <p className="text-[11px] sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Drafts</p>
          <h3 className="text-xl sm:text-3xl font-bold text-yellow-600 mt-1 sm:mt-2">{draftCount}</h3>
        </Card>
      </div>

      <Card className="overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Views</th>
                <th className="px-6 py-4 font-semibold">Created Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <TableLoader colSpan={5} text="Loading blogs..." />
              ) : blogs.length === 0 ? (
                <TableLoader colSpan={5} text="No blogs found. Create your first post!" />
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded object-cover flex-shrink-0 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-200">
                          {blog.featuredImage ? (
                            <img src={`/${blog.featuredImage}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] uppercase font-bold text-gray-400">No Img</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 max-w-xs truncate">{blog.title}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5 truncate max-w-xs">/{blog.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1 border",
                        blog.status === 'Published' ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      )}>
                        {blog.status === 'Published' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 text-gray-700 font-semibold bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 text-xs">
                        <BarChart2 size={12} className="text-gray-400" />
                        {blog.views || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {blog.status === 'Draft' ? (
                           <button onClick={() => { if(window.confirm('Are you sure you want to publish this blog?')) updateStatus(blog.id, 'Published'); }} title="Publish" className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"><CheckCircle size={16} /></button>
                        ) : (
                           <button onClick={() => { if(window.confirm('Are you sure you want to revert this to draft?')) updateStatus(blog.id, 'Draft'); }} title="Unpublish (Draft)" className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"><Clock size={16} /></button>
                        )}
                        <Link to={`/dashboard/blogs/${blog.id}`} title="Edit" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></Link>
                        <button 
                          onClick={async () => {
                            const token = await auth.currentUser?.getIdToken();
                            const url = `http://${profile?.subdomain ? `${profile.subdomain}.` : ''}${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/blogs/${blog.slug}?token=${token}`;
                            window.open(url, '_blank');
                          }}
                          title="Preview" 
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        ><Eye size={16} /></button>
                        <button onClick={() => handleDuplicate(blog)} title="Duplicate" className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"><Copy size={16} /></button>
                        <button onClick={() => handleDelete(blog.id)} title="Delete" className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading blogs...</div>
          ) : blogs.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No blogs found. Create your first post!</div>
          ) : (
            blogs.map((blog) => (
              <div key={blog.id} className="p-4 flex flex-col gap-4">
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg object-cover flex-shrink-0 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-200">
                    {blog.featuredImage ? (
                      <img src={`/${blog.featuredImage}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-gray-400">No Img</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{blog.title}</p>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">/{blog.slug}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className={clsx(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border",
                        blog.status === 'Published' ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      )}>
                        {blog.status === 'Published' ? <CheckCircle size={10} /> : <Clock size={10} />}
                        {blog.status}
                      </span>
                      <span className="inline-flex items-center gap-1 text-gray-600 font-semibold bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 text-[10px]">
                        <BarChart2 size={10} className="text-gray-400" />
                        {blog.views || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                  <span className="text-[11px] text-gray-400 font-medium">
                    {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    {blog.status === 'Draft' ? (
                       <button onClick={() => { if(window.confirm('Are you sure you want to publish this blog?')) updateStatus(blog.id, 'Published'); }} title="Publish" className="p-1.5 text-green-600 bg-green-50 rounded transition-colors"><CheckCircle size={14} /></button>
                    ) : (
                       <button onClick={() => { if(window.confirm('Are you sure you want to revert this to draft?')) updateStatus(blog.id, 'Draft'); }} title="Unpublish (Draft)" className="p-1.5 text-yellow-600 bg-yellow-50 rounded transition-colors"><Clock size={14} /></button>
                    )}
                    <Link to={`/dashboard/blogs/${blog.id}`} title="Edit" className="p-1.5 text-blue-600 bg-blue-50 rounded transition-colors"><Edit2 size={14} /></Link>
                    <button 
                      onClick={async () => {
                        const token = await auth.currentUser?.getIdToken();
                        const url = `http://${profile?.subdomain ? `${profile.subdomain}.` : ''}${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/blogs/${blog.slug}?token=${token}`;
                        window.open(url, '_blank');
                      }}
                      title="Preview" 
                      className="p-1.5 text-gray-600 bg-gray-100 rounded transition-colors"
                    ><Eye size={14} /></button>
                    <button onClick={() => handleDuplicate(blog)} title="Duplicate" className="p-1.5 text-purple-600 bg-purple-50 rounded transition-colors"><Copy size={14} /></button>
                    <button onClick={() => handleDelete(blog.id)} title="Delete" className="p-1.5 text-red-600 bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
