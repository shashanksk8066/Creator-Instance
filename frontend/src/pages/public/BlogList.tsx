import { Loader } from '../../components/Loader';
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { clsx } from 'clsx';

export const BlogList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('q');

  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        let url = `/api/public/blogs?limit=50`;
        if (categoryParam) url += `&category=${categoryParam}`;
        if (searchParam) url += `&q=${encodeURIComponent(searchParam)}`;
          
        const [blogsRes, catRes] = await Promise.all([
          fetch(url),
          fetch('/api/public/categories')
        ]);
        
        if (blogsRes.ok) setBlogs(await blogsRes.json());
        if (catRes.ok) setCategories(await catRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [categoryParam, searchParam]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          {searchParam ? `Search Results for "${searchParam}"` : "Explore latest updates"}
        </h1>
        {searchParam && (
          <p className="text-gray-500 text-lg">
            Find the content you're looking for below.
          </p>
        )}
      </div>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
           <button 
             onClick={() => setSearchParams({})}
             className={clsx(
               "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
               !categoryParam ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
             )}
           >
             All
           </button>
           {categories.map(cat => (
             <button 
               key={cat.id}
               onClick={() => setSearchParams({ category: cat.id })}
               className={clsx(
                 "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                 categoryParam === cat.id ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
               )}
             >
               {cat.name}
             </button>
           ))}
        </div>
      )}

      {loading ? (
        <Loader text="Loading articles..." />
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
          <p className="text-gray-500">No articles found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map(blog => (
            <Link key={blog.id} to={`/blogs/${blog.slug}`} className="group block h-full ad-cta-button">
              <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative">
                  {blog.featuredImage ? (
                    <img src={`/${blog.featuredImage}`} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wider">
                    {format(new Date(blog.publishedAt), 'MMM d, yyyy')}
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-3 text-sm mb-4 flex-1">
                    {blog.content.substring(0, 150)}...
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
