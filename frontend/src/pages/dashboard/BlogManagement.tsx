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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Blog Management</h2>
        <Link 
          to="/dashboard/blogs/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Create New Blog
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-500">Total Blogs</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{blogs.length}</h3>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-500">Published</p>
          <h3 className="text-3xl font-bold text-green-600 mt-2">{publishedCount}</h3>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-500">Drafts</p>
          <h3 className="text-3xl font-bold text-yellow-600 mt-2">{draftCount}</h3>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Views</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Created Date</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Last Updated</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <TableLoader colSpan={5} text="Loading blogs..." />
              ) : blogs.length === 0 ? (
                <TableLoader colSpan={6} text="No blogs found. Create your first post!" />
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded object-cover flex-shrink-0 flex items-center justify-center text-gray-400 overflow-hidden">
                          {blog.featuredImage ? (
                            <img src={`/${blog.featuredImage}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs">No Img</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{blog.title}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">/{blog.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1",
                        blog.status === 'Published' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      )}>
                        {blog.status === 'Published' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-gray-600 font-medium">
                        <BarChart2 size={14} className="text-gray-400" />
                        {blog.views || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-500">
                      {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-500">
                      {format(new Date(blog.updatedAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {blog.status === 'Draft' ? (
                           <button onClick={() => { if(window.confirm('Are you sure you want to publish this blog?')) updateStatus(blog.id, 'Published'); }} title="Publish" className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"><CheckCircle size={16} /></button>
                        ) : (
                           <button onClick={() => { if(window.confirm('Are you sure you want to revert this to draft?')) updateStatus(blog.id, 'Draft'); }} title="Unpublish (Draft)" className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"><Clock size={16} /></button>
                        )}
                        <Link to={`/dashboard/blogs/${blog.id}`} title="Edit" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 size={16} /></Link>
                        <button 
                          onClick={async () => {
                            const token = await auth.currentUser?.getIdToken();
                            const url = `http://${profile?.subdomain ? `${profile.subdomain}.` : ''}${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/blogs/${blog.slug}?token=${token}`;
                            window.open(url, '_blank');
                          }}
                          title="Preview" 
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        ><Eye size={16} /></button>
                        <button onClick={() => handleDuplicate(blog)} title="Duplicate" className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"><Copy size={16} /></button>
                        <button onClick={() => handleDelete(blog.id)} title="Delete" className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
