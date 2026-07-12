import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export const Home = () => {
  const [creator, setCreator] = useState<any>(null);
  const [latestBlogs, setLatestBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blogs?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/blogs');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [creatorRes, blogsRes] = await Promise.all([
          fetch('/api/public/creator'),
          fetch('/api/public/blogs?limit=6')
        ]);
        
        if (creatorRes.ok) setCreator(await creatorRes.json());
        if (blogsRes.ok) setLatestBlogs(await blogsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-12 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-4 px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
          Welcome to <span className="text-blue-600">{creator?.fullName || 'My Website'}</span>
        </h1>
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mt-8 flex items-center bg-white border border-gray-200 rounded-full shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for articles, tutorials..." 
            className="flex-1 px-6 py-4 outline-none text-gray-700 bg-transparent"
          />
          <button type="submit" className="px-8 py-4 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
            Search
          </button>
        </form>
      </section>

      {/* Latest Blogs */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Latest Articles</h2>
          <Link to="/blogs" className="text-sm font-medium text-blue-600 hover:underline">View all →</Link>
        </div>
        
        {latestBlogs.length === 0 ? (
           <p className="text-gray-500 text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
             No articles published yet. Check back soon!
           </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestBlogs.map(blog => (
              <Link key={blog.id} to={`/blogs/${blog.slug}`} className="group block h-full ad-cta-button">
                <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className="aspect-[16/10] bg-gray-100 overflow-hidden relative">
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
                    <div className="flex items-center text-sm font-medium text-gray-900 mt-auto">
                      Read article <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
