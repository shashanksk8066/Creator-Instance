import { Loader } from '../../components/Loader';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { ArrowLeft, Save, Info, AlertTriangle } from 'lucide-react';
import { containsUrl } from '../../utils/urlValidator';

interface InstagramAccount {
  accountId: string;
  username: string;
  accessToken: string;
}

export const AutoDmRuleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  
  const [media, setMedia] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  // Form State
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [triggerType, setTriggerType] = useState<'keyword' | 'any'>('keyword');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  
  const [greeting, setGreeting] = useState('Hi there! 👋');
  const [body, setBody] = useState('Here is the link you requested:');
  const [ctaText, setCtaText] = useState('Read More');
  const [blogId, setBlogId] = useState('');
  const [publicReply, setPublicReply] = useState('Check your DM 😊');
  const [enablePublicReply, setEnablePublicReply] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  useEffect(() => {
    if (selectedAccountId) {
      fetchMedia(selectedAccountId);
    } else {
      setMedia([]);
    }
  }, [selectedAccountId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch accounts via backend
      if (auth.currentUser) {
        const accountsRes = await fetch('/api/instagram/accounts', { headers });
        if (accountsRes.ok) {
          const igAccountsMap = await accountsRes.json();
          const accountsList = Object.values(igAccountsMap) as InstagramAccount[];
          setAccounts(accountsList);
        }
      }

      // Fetch Blogs
      const blogsRes = await fetch('/api/blogs', { headers });
      if (blogsRes.ok) {
        const allBlogs = await blogsRes.json();
        setBlogs(allBlogs.filter((b: any) => b.status === 'Published'));
      }

      // Fetch Rule if Editing
      if (id) {
        const rulesRes = await fetch('/api/auto-dm/rules', { headers });
        if (rulesRes.ok) {
          const rules = await rulesRes.json();
          const rule = rules.find((r: any) => r.id === id);
          if (rule) {
            setSelectedAccountId(rule.accountId || '');
            setSelectedPosts(rule.selectedPosts || []);
            setTriggerType(rule.triggerType);
            setKeywords(rule.keywords || []);
            setGreeting(rule.greeting || '');
            setBody(rule.body || '');
            setCtaText(rule.ctaText || 'Read More');
            setBlogId(rule.blogId || '');
            if (rule.publicReply) {
              setEnablePublicReply(true);
              setPublicReply(rule.publicReply);
            } else {
              setEnablePublicReply(false);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedia = async (accountId: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const headers = { 'Authorization': `Bearer ${token}` };
      const mediaRes = await fetch(`/api/instagram/media?accountId=${accountId}`, { headers });
      if (mediaRes.ok) {
        setMedia(await mediaRes.json());
      } else {
        setMedia([]);
      }
    } catch (error) {
      console.error(error);
      setMedia([]);
    }
  };

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = keywordInput.trim();
      if (val && !keywords.includes(val.toLowerCase())) {
        setKeywords([...keywords, val.toLowerCase()]);
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (k: string) => {
    setKeywords(keywords.filter(keyword => keyword !== k));
  };

  const togglePost = (postId: string) => {
    if (selectedPosts.includes(postId)) {
      setSelectedPosts(selectedPosts.filter(pid => pid !== postId));
    } else {
      setSelectedPosts([...selectedPosts, postId]);
    }
  };

  const hasUrlError = containsUrl(greeting) || containsUrl(body) || (enablePublicReply && containsUrl(publicReply));

  const handleSave = async () => {
    // Validation
    if (!selectedAccountId) return alert('Select an Instagram account.');
    if (selectedPosts.length === 0) return alert('Select at least one post.');
    if (triggerType === 'keyword' && keywords.length === 0) return alert('Add at least one keyword.');
    if (!blogId) return alert('Select a published blog to link.');
    if (containsUrl(greeting) || containsUrl(body) || (enablePublicReply && containsUrl(publicReply))) {
      return alert('URLs are strictly prohibited in the message text. The platform will auto-generate the blog link.');
    }

    setSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const payload = {
        accountId: selectedAccountId,
        selectedPosts,
        triggerType,
        keywords,
        greeting,
        body,
        ctaText,
        blogId,
        publicReply: enablePublicReply ? publicReply : null
      };

      const url = id ? `/api/auto-dm/rules/${id}` : '/api/auto-dm/rules';
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save rule');
      
      navigate('/dashboard/auto-dm/rules');
    } catch (err) {
      console.error(err);
      alert('Error saving rule');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading editor..." />;

  const getPreviewText = () => {
    let text = greeting ? `${greeting}\n\n` : '';
    text += body || '';
    if (!text.trim()) return "Here is the information you requested.";
    return text;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard/auto-dm/rules" className="text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{id ? 'Edit Auto DM Rule' : 'New Auto DM Rule'}</h1>
          <p className="text-gray-500 text-sm">Automate private messages when users comment on your posts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">
        
        {/* Step 0: Select Account */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Instagram Account</h2>
          <select 
            value={selectedAccountId} 
            onChange={(e) => {
              setSelectedAccountId(e.target.value);
              setSelectedPosts([]); // Reset posts when account changes
            }}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">Select an account...</option>
            {accounts.map(acc => (
              <option key={acc.accountId} value={acc.accountId}>@{acc.username}</option>
            ))}
          </select>
        </div>

        {/* Step 1: Select Posts */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">1. Select Posts</h2>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{selectedPosts.length} selected</span>
          </div>
          
          {!selectedAccountId && <p className="text-sm text-gray-500">Please select an Instagram account first.</p>}
          {selectedAccountId && media.length === 0 && <p className="text-sm text-gray-500">No posts found or loading...</p>}
          
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-h-80 overflow-y-auto pr-2">
            {media.map((post: any) => (
              <div 
                key={post.id}
                onClick={() => togglePost(post.id)}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedPosts.includes(post.id) ? 'border-blue-600 ring-2 ring-blue-600 ring-opacity-50' : 'border-transparent hover:border-blue-300'
                }`}
              >
                <img 
                  src={post.thumbnail_url || post.media_url} 
                  alt="Post" 
                  className="w-full h-32 object-cover bg-gray-100" 
                />
                <div className={`absolute inset-0 bg-blue-600/20 ${selectedPosts.includes(post.id) ? 'block' : 'hidden'}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Trigger Condition */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Trigger Condition</h2>
          <div className="flex gap-6 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="triggerType" 
                value="keyword" 
                checked={triggerType === 'keyword'}
                onChange={() => setTriggerType('keyword')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">Specific Keywords</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="triggerType" 
                value="any" 
                checked={triggerType === 'any'}
                onChange={() => setTriggerType('any')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">Any Comment</span>
            </label>
          </div>

          {triggerType === 'keyword' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {keywords.map(k => (
                  <span key={k} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {k}
                    <button onClick={() => removeKeyword(k)} className="hover:text-blue-900">&times;</button>
                  </span>
                ))}
              </div>
              <input 
                type="text" 
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleAddKeyword}
                placeholder="Type a keyword and press Enter (e.g. LINK, JOB)"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 outline-none"
              />
            </div>
          )}
        </div>

        {/* Step 3: DM Content & Blog */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Setup Private DM & Target Blog</h2>
          
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-6 flex gap-3 text-sm">
            <AlertTriangle size={20} className="shrink-0 text-yellow-600" />
            <div>
              <p className="font-semibold mb-1">Strict Limitations</p>
              <p>URLs, Links, HTML, and JS are strictly prohibited in the text inputs. The CTA button will automatically link to the blog you select below.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
              <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Use Spintax to Avoid Spam Filters</p>
                <p>You can automatically vary your messages using Spintax format. For example, writing <code className="bg-blue-100 px-1 rounded text-blue-900">{`{Hi|Hey|Hello}`}</code> will randomly select one of those words for each DM sent.</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Greeting</label>
              <input type="text" value={greeting} onChange={(e) => setGreeting(e.target.value)} className={`w-full bg-gray-50 border ${containsUrl(greeting) ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 outline-none`} placeholder="Hi there!" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className={`w-full bg-gray-50 border ${containsUrl(body) ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 outline-none`} placeholder="Here is the link..." />
            </div>
            
            {hasUrlError && (
              <div className="text-red-600 text-sm font-medium p-3 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2">
                <AlertTriangle size={18} />
                Links are not allowed inside the message. Please use the CTA Button below to attach a blog link.
              </div>
            )}
            
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2"><Info size={16} /> Link Generation (CTA)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Read More" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Blog to Link</label>
                  <select value={blogId} onChange={(e) => setBlogId(e.target.value)} className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                    <option value="">Select a published blog...</option>
                    {blogs.map(b => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Public Reply */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">4. Public Comment Reply (Optional)</h2>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={enablePublicReply} onChange={(e) => setEnablePublicReply(e.target.checked)} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${enablePublicReply ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${enablePublicReply ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </label>
          </div>
          
          {enablePublicReply && (
            <input 
              type="text" 
              value={publicReply}
              onChange={(e) => setPublicReply(e.target.value)}
              className={`w-full bg-gray-50 border ${containsUrl(publicReply) ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 outline-none`} 
              placeholder="Check your DM 😊" 
            />
          )}
        </div>
          </div>
        
          <div className="flex justify-end pt-6">
            <button
              onClick={handleSave}
              disabled={saving || hasUrlError}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium text-lg shadow-sm"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Rule'}
            </button>
          </div>
        </div>

        {/* Live Preview Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 mx-auto w-[300px] bg-gray-50 border-[8px] border-black rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative overflow-hidden" style={{ height: '600px' }}>
            {/* Fake phone notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-black rounded-b-2xl mx-auto w-[40%] z-10"></div>
            
            <div className="text-center mb-8 mt-6 border-b border-gray-200 pb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Instagram DM</p>
            </div>
            
            <div className="flex flex-col gap-4">
              {/* Sender Message (User) */}
              <div className="self-end max-w-[80%] bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm text-sm">
                <p>Hey! Can you send me the link?</p>
              </div>
              
              {/* Receiver Message (Bot Button Template) */}
              <div className="self-start max-w-[90%] bg-white border border-gray-200 rounded-2xl rounded-tl-sm overflow-hidden shadow-sm flex flex-col">
                <div className="px-4 py-3 text-[15px] text-gray-900 whitespace-pre-wrap leading-snug">
                  {getPreviewText()}
                </div>
                <div className="border-t border-gray-100 bg-gray-50">
                  <div className="w-full py-3 text-center text-[15px] font-semibold text-blue-500">
                    {ctaText || 'Read More'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
