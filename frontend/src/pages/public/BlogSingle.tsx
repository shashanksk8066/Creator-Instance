import { Loader } from '../../components/Loader';
import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronLeft } from 'lucide-react';
import { auth } from '../../config/firebase';
import { ArticleTopAds, ArticleMiddleAds, ArticleBottomAds, BeforeRelatedPostsAds } from '../../components/ads/AdPlacements';

export const BlogSingle = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [blog, setBlog] = useState<any>(null);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        const headers: Record<string, string> = {};
        
        const urlToken = searchParams.get('token');
        const token = urlToken || (user ? await user.getIdToken() : null);
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const [res, tagsRes] = await Promise.all([
          fetch(`/api/public/blogs/${slug}`, { headers }),
          fetch(`/api/public/tags`, { headers })
        ]);

        if (res.ok) setBlog(await res.json());
        if (tagsRes.ok) setAllTags(await tagsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [slug]);

  if (loading) return <Loader text="Loading article..." />;
  if (!blog) return <div className="p-12 text-center text-gray-500">Article not found.</div>;

  return (
    <article className="max-w-3xl mx-auto space-y-8 bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-100">
      <Link to="/blogs" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
        <ChevronLeft size={16} className="mr-1" /> Back to all articles
      </Link>

      <header className="space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
          {blog.title}
        </h1>
        <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
          <time dateTime={blog.publishedAt}>{format(new Date(blog.publishedAt), 'MMMM d, yyyy')}</time>
          {blog.tags && blog.tags.length > 0 && (
            <>
              <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></span>
              <div className="flex flex-wrap gap-2">
                {blog.tags.slice(0, 4).map((tagId: string) => {
                  const tag = allTags.find(t => t.id === tagId);
                  if (!tag) return null;
                  return (
                    <span key={tag.id} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      {tag.name}
                    </span>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </header>

      <ArticleTopAds />

      {blog.featuredImage && (
        <div className="aspect-[21/9] rounded-xl overflow-hidden bg-gray-100">
          <img src={`/${blog.featuredImage}`} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Renders TipTap HTML cleanly using Tailwind Typography, with middle ads injected */}
      <ArticleMiddleAds content={blog.html} />

      <ArticleBottomAds />
      <BeforeRelatedPostsAds />

      {/* Promotional Banner */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8 text-center shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Are you a Creator?</h3>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          Start monetizing your audience today with your own custom blog, built-in ad revenue, and <strong className="text-blue-700">Free Unlimited Instagram Auto DMs</strong> for comments. 
          Earn passive income just like the creator of this post!
        </p>
        <a 
          href={`${window.location.protocol}//${import.meta.env.VITE_BASE_DOMAIN || 'localhost:5173'}`} 
          className="inline-flex px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
        >
          Join Creator Instance
        </a>
      </div>
    </article>
  );
};
