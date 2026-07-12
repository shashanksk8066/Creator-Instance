import { useState, useEffect } from 'react';
import { auth } from '../../config/firebase';
import { Tag, Folder, Plus, Trash2 } from 'lucide-react';

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

export const TaxonomyManager = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [newCat, setNewCat] = useState('');
  const [newTag, setNewTag] = useState('');

  const fetchTaxonomies = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const [catRes, tagRes] = await Promise.all([
        fetch('/api/categories', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/tags', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setCategories(await catRes.json());
      setTags(await tagRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTaxonomies();
  }, []);

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCat })
      });
      setNewCat('');
      fetchTaxonomies();
    } catch (err) {
      console.error(err);
    }
  };

  const addTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTag })
      });
      setNewTag('');
      fetchTaxonomies();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (type: 'categories' | 'tags', id: string) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`/api/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTaxonomies();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Categories & Tags</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 text-blue-600 border-b border-gray-100 pb-3">
            <Folder size={20} />
            <h3 className="text-lg font-bold">Categories</h3>
          </div>
          
          <form onSubmit={addCategory} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="New Category Name" 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md flex items-center gap-1 text-sm font-medium transition-colors">
              <Plus size={16} /> Add
            </button>
          </form>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100 hover:bg-gray-100 transition-colors">
                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                <button onClick={() => deleteItem('categories', cat.id)} className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {categories.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No categories created yet.</p>}
          </div>
        </Card>

        {/* Tags */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 text-purple-600 border-b border-gray-100 pb-3">
            <Tag size={20} />
            <h3 className="text-lg font-bold">Tags</h3>
          </div>
          
          <form onSubmit={addTag} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="New Tag Name" 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md flex items-center gap-1 text-sm font-medium transition-colors">
              <Plus size={16} /> Add
            </button>
          </form>

          <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium">
                <span>{tag.name}</span>
                <button onClick={() => deleteItem('tags', tag.id)} className="text-purple-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {tags.length === 0 && <p className="text-sm text-gray-500 text-center py-4 w-full">No tags created yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};
