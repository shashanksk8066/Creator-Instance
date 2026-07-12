import { Loader } from '../../components/Loader';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { FontSize } from '../../components/editor/FontSizeExtension';
import { CallToActionExtension } from '../../components/editor/CallToActionExtension';
import { auth } from '../../config/firebase';
import { Save, UploadCloud, ChevronLeft, MousePointerClick, CheckCircle, Undo, Redo, Table as TableIcon, Video as YoutubeIcon, Minus, Code, X } from 'lucide-react';
import { clsx } from 'clsx';

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap gap-2 p-4 border border-gray-200 bg-white rounded-xl shadow-sm items-center text-sm mb-6 sticky top-6 z-10">
      
      <select 
        onChange={(e) => {
          if (e.target.value === '') {
            editor.chain().focus().unsetFontSize().run();
          } else {
            editor.chain().focus().setFontSize(e.target.value).run();
          }
        }}
        className="p-1 mr-1 text-sm bg-gray-50 border border-gray-200 rounded outline-none focus:border-blue-500"
        defaultValue=""
      >
        <option value="">Size</option>
        <option value="12px">12</option>
        <option value="14px">14</option>
        <option value="16px">16</option>
        <option value="18px">18</option>
        <option value="20px">20</option>
        <option value="24px">24</option>
        <option value="30px">30</option>
      </select>

      <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50" title="Undo"><Undo size={16} /></button>
      <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50" title="Redo"><Redo size={16} /></button>
      
      <div className="w-px h-4 bg-gray-300 mx-1"></div>

      <button onClick={() => editor.chain().focus().toggleBold().run()} className={clsx("p-1.5 rounded hover:bg-gray-200", editor.isActive('bold') && "bg-gray-200 font-bold")} title="Bold">B</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={clsx("p-1.5 rounded hover:bg-gray-200 italic", editor.isActive('italic') && "bg-gray-200")} title="Italic">I</button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={clsx("p-1.5 rounded hover:bg-gray-200 underline", editor.isActive('underline') && "bg-gray-200")} title="Underline">U</button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={clsx("p-1.5 rounded hover:bg-gray-200 line-through", editor.isActive('strike') && "bg-gray-200")} title="Strike">S</button>
      
      <div className="w-px h-4 bg-gray-300 mx-1"></div>
      
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={clsx("p-1.5 rounded hover:bg-gray-200 font-bold", editor.isActive('heading', { level: 1 }) && "bg-gray-200")} title="Heading 1">H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={clsx("p-1.5 rounded hover:bg-gray-200 font-bold", editor.isActive('heading', { level: 2 }) && "bg-gray-200")} title="Heading 2">H2</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={clsx("p-1.5 rounded hover:bg-gray-200 font-bold", editor.isActive('heading', { level: 3 }) && "bg-gray-200")} title="Heading 3">H3</button>
      
      <div className="w-px h-4 bg-gray-300 mx-1"></div>
      
      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={clsx("p-1.5 rounded hover:bg-gray-200", editor.isActive({ textAlign: 'left' }) && "bg-gray-200")} title="Align Left">Left</button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={clsx("p-1.5 rounded hover:bg-gray-200", editor.isActive({ textAlign: 'center' }) && "bg-gray-200")} title="Align Center">Center</button>
      <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={clsx("p-1.5 rounded hover:bg-gray-200", editor.isActive({ textAlign: 'justify' }) && "bg-gray-200")} title="Justify">Justify</button>

      <div className="w-px h-4 bg-gray-300 mx-1"></div>
      
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={clsx("p-1.5 rounded hover:bg-gray-200", editor.isActive('bulletList') && "bg-gray-200")} title="Bullet List">• List</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={clsx("p-1.5 rounded hover:bg-gray-200", editor.isActive('orderedList') && "bg-gray-200")} title="Numbered List">1. List</button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={clsx("p-1.5 rounded hover:bg-gray-200", editor.isActive('blockquote') && "bg-gray-200")} title="Quote">Quote</button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={clsx("p-1.5 rounded hover:bg-gray-200 flex items-center gap-1", editor.isActive('codeBlock') && "bg-gray-200")} title="Code Block"><Code size={16} /></button>
      <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={clsx("p-1.5 rounded hover:bg-gray-200 flex items-center gap-1", editor.isActive('table') && "bg-gray-200")} title="Insert Table"><TableIcon size={16} /></button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="p-1.5 rounded hover:bg-gray-200 flex items-center gap-1" title="Horizontal Line"><Minus size={16} /></button>
      
      {editor.isActive('table') && (
        <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-100">
          <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="p-1 rounded hover:bg-blue-200 text-xs font-medium text-blue-700" title="Add Column After">Col +</button>
          <button onClick={() => editor.chain().focus().deleteColumn().run()} className="p-1 rounded hover:bg-blue-200 text-xs font-medium text-red-600" title="Delete Column">Col -</button>
          <div className="w-px h-3 bg-blue-200 mx-1"></div>
          <button onClick={() => editor.chain().focus().addRowAfter().run()} className="p-1 rounded hover:bg-blue-200 text-xs font-medium text-blue-700" title="Add Row After">Row +</button>
          <button onClick={() => editor.chain().focus().deleteRow().run()} className="p-1 rounded hover:bg-blue-200 text-xs font-medium text-red-600" title="Delete Row">Row -</button>
          <div className="w-px h-3 bg-blue-200 mx-1"></div>
          <button onClick={() => editor.chain().focus().deleteTable().run()} className="p-1 rounded hover:bg-red-200 text-xs font-bold text-red-700" title="Delete Table">Drop</button>
        </div>
      )}
      

      
      <div className="w-px h-4 bg-gray-300 mx-1"></div>

      <button 
        onClick={() => {
          const url = window.prompt('URL');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        className={clsx("p-1.5 rounded hover:bg-gray-200 text-blue-600", editor.isActive('link') && "bg-gray-200")}
        title="Link"
      >Link</button>

      <button 
        onClick={() => {
          const url = window.prompt('Image URL (or use sidebar for local upload)');
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
        className="p-1.5 rounded hover:bg-gray-200 text-green-600"
        title="Image"
      >Image</button>

      <button 
        onClick={() => {
          const url = window.prompt('YouTube Video URL');
          if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }}
        className="p-1.5 rounded hover:bg-gray-200 text-red-600 flex items-center gap-1"
        title="YouTube Embed"
      ><YoutubeIcon size={16} /></button>

      <div className="w-px h-4 bg-gray-300 mx-1"></div>

      <button 
        onClick={() => {
          const text = window.prompt('Button Text', 'Click Here');
          if (!text) return;
          const url = window.prompt('Destination URL', 'https://');
          if (!url) return;
          const style = window.prompt('Style (primary, secondary, outline)', 'primary') || 'primary';
          
          editor.chain().focus().insertCallToAction({ text, url, newTab: true, style }).run();
        }}
        className="p-1.5 rounded bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 flex items-center gap-1"
        title="Insert Call to Action Button"
      ><MousePointerClick size={14} /> CTA Button</button>
    </div>
  );
};

export const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useOutletContext<{ profile: any }>();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  
  // Taxonomies State
  const [categories, setCategories] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  
  // Blog State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('Draft');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [selectedCTA, setSelectedCTA] = useState<any>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph', 'callToAction'] }),
      Youtube,
      Color,
      TextStyle,
      FontSize,
      CallToActionExtension,
      Placeholder.configure({
        placeholder: 'Start writing your awesome blog here...',
      })
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-blue max-w-none focus:outline-none min-h-[400px] p-6',
      },
    },
    onSelectionUpdate: ({ editor }) => {
      if (editor.isActive('callToAction')) {
        setSelectedCTA(editor.getAttributes('callToAction'));
      } else {
        setSelectedCTA(null);
      }
    },
  });

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const [catRes, tagRes] = await Promise.all([
          fetch('/api/categories', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/tags', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        setCategories(await catRes.json());
        setAvailableTags(await tagRes.json());
        
        if (id) {
          const blogRes = await fetch(`/api/blogs/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
          const blog = await blogRes.json();
          setTitle(blog.title);
          setSlug(blog.slug);
          setStatus(blog.status);
          setCategoryId(blog.categoryId || '');
          setTags(blog.tags || []);
          setSeoTitle(blog.seoTitle || '');
          setSeoDesc(blog.seoDesc || '');
          setFeaturedImage(blog.featuredImage || null);
          if (editor && blog.html) {
             editor.commands.setContent(blog.html);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (editor) {
      fetchDependencies();
    }
  }, [id, editor]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      setFeaturedImage(data.path);
    } catch (err) {
      console.error(err);
      alert('Image upload failed');
    }
  };

  const handleImageDelete = async () => {
    if (!featuredImage) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: featuredImage })
      });
      setFeaturedImage(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete image');
    }
  };

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    setSaving(true);
    const newStatus = publish ? 'Published' : status;
    const html = editor?.getHTML() || '';
    
    const blogData = {
      title,
      customSlug: slug,
      html,
      content: editor?.getText() || '',
      status: newStatus,
      categoryId,
      tags,
      seoTitle,
      seoDesc,
      featuredImage
    };

    try {
      const token = await auth.currentUser?.getIdToken();
      const url = id ? `/api/blogs/${id}` : '/api/blogs';
      const method = id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(blogData)
      });
      const savedBlog = await res.json();
      
      if (!id) {
        navigate(`/dashboard/blogs/${savedBlog.id}`, { replace: true });
      }
      setStatus(newStatus);
      setSlug(savedBlog.slug);
    } catch (err) {
      console.error(err);
      alert('Failed to save blog');
    } finally {
      setSaving(false);
    }
  };


  if (loading) return <Loader text="Loading Editor..." />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/dashboard/blogs')} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
          <ChevronLeft size={20} /> Back to Blogs
        </button>
        <div className="flex gap-3">
           <button 
             onClick={async () => {
               const token = await auth.currentUser?.getIdToken();
               const url = `http://${profile?.subdomain ? `${profile.subdomain}.` : ''}${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/blogs/${slug}?token=${token}`;
               window.open(url, '_blank');
             }}
             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
           >
             Preview Live
           </button>
           <button 
             onClick={() => {
                if (window.confirm('Are you sure you want to save this as a draft?')) handleSave(false);
             }} 
             disabled={saving}
             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
           >
             <Save size={16} /> {saving ? 'Saving...' : (status === 'Draft' ? 'Drafted' : 'Save Draft')}
           </button>
           <button 
             onClick={() => {
                if (window.confirm('Are you sure you want to publish this blog live?')) handleSave(true);
             }} 
             disabled={saving}
             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
           >
             <CheckCircle size={16} /> {saving ? 'Publishing...' : (status === 'Published' ? 'Published' : 'Publish')}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Editor Area */}
        <div className="lg:col-span-8 space-y-6">
           <input 
             type="text" 
             value={title}
             onChange={(e) => setTitle(e.target.value)}
             placeholder="Blog Title..." 
             className="w-full text-4xl font-bold text-gray-900 bg-transparent border-0 border-b-2 border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-0 px-0 py-2 transition-colors placeholder:text-gray-300"
           />
           
           <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Slug: </span>
              <input 
                type="text" 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated-slug"
                className="flex-1 bg-transparent border-none text-gray-500 focus:ring-0 focus:text-gray-900 p-0"
              />
           </div>

           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <EditorContent editor={editor} />
           </div>
        </div>

        {/* Sidebar Settings */}
        <div className="lg:col-span-4 relative">
          <div className="sticky top-6 space-y-6">
            {selectedCTA ? (
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-900 mb-2">Button Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input 
                    type="text" 
                    value={selectedCTA.text}
                    onChange={(e) => {
                      editor?.chain().focus().updateAttributes('callToAction', { text: e.target.value }).run();
                    }}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination URL</label>
                  <input 
                    type="text" 
                    value={selectedCTA.url}
                    onChange={(e) => {
                      editor?.chain().focus().updateAttributes('callToAction', { url: e.target.value }).run();
                    }}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
                  <select 
                    value={selectedCTA.style}
                    onChange={(e) => {
                      editor?.chain().focus().updateAttributes('callToAction', { style: e.target.value }).run();
                    }}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="primary">Primary (Solid Blue)</option>
                    <option value="secondary">Secondary (Light Gray)</option>
                    <option value="outline">Outline (Border Blue)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input 
                    type="checkbox" 
                    id="newTab" 
                    checked={selectedCTA.newTab}
                    onChange={(e) => {
                      editor?.chain().focus().updateAttributes('callToAction', { newTab: e.target.checked }).run();
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="newTab" className="text-sm font-medium text-gray-700">Open in new tab</label>
                </div>
                <p className="text-xs text-gray-500 mt-4 italic">Click elsewhere in the editor to return to blog settings.</p>
              </div>
            ) : (
              <>
                 <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                   <h3 className="font-semibold text-gray-900 mb-2">Featured Image</h3>
                   {featuredImage ? (
                      <div className="relative group rounded-md overflow-hidden bg-gray-100">
                        <img src={`/${featuredImage}`} alt="Featured" className="w-full h-40 object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={handleImageDelete} className="text-white text-sm font-medium hover:underline">Remove</button>
                        </div>
                      </div>
                   ) : (
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <UploadCloud size={24} className="text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-500">Upload Image</span>
                        <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
                      </label>
                   )}
                 </div>

                 <MenuBar editor={editor} />
                 
                 <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4 mt-6">
                   <h3 className="font-semibold text-gray-900 mb-2">Categories & Tags</h3>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                     <select 
                       value={categoryId}
                       onChange={(e) => setCategoryId(e.target.value)}
                       className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors hover:bg-gray-100 cursor-pointer"
                     >
                       <option value="">Select a category</option>
                       {categories.map(cat => (
                         <option key={cat.id} value={cat.id}>{cat.name}</option>
                       ))}
                     </select>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                     <div className="flex flex-wrap gap-2 mb-2">
                       {tags.map(t => (
                         <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 font-medium">
                           {availableTags.find(at => at.id === t)?.name || t}
                           <button onClick={() => setTags(tags.filter(tag => tag !== t))} className="hover:text-blue-900"><X size={12} /></button>
                         </span>
                       ))}
                     </div>
                     <select 
                       onChange={(e) => {
                         const val = e.target.value;
                         if (val && !tags.includes(val)) {
                           if (tags.length >= 4) {
                             alert('You can only select up to 4 tags.');
                           } else {
                             setTags([...tags, val]);
                           }
                         }
                         e.target.value = '';
                       }}
                       className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors hover:bg-gray-100 cursor-pointer"
                       defaultValue=""
                     >
                       <option value="" disabled>+ Add a tag</option>
                       {availableTags.filter(t => !tags.includes(t.id)).map(tag => (
                         <option key={tag.id} value={tag.id}>{tag.name}</option>
                       ))}
                     </select>
                   </div>
                 </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
