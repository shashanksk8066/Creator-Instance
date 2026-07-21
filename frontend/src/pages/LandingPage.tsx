import { Link } from 'react-router-dom';
import { ArrowRight, Globe, DollarSign, Zap, ShieldCheck, TrendingUp } from 'lucide-react';
import { Logo } from '../components/Logo';

const InstagramIcon = ({ size = 28 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Log in
            </Link>
            <Link to="/register" className="text-sm font-bold bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-black transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8 border border-blue-100">
          <Zap size={16} className="text-blue-500" />
          <span>The ultimate monetization platform for creators</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-6 md:mb-8 leading-[1.1] max-w-4xl mx-auto px-2">
          Turn your <span className="text-blue-600">Instagram audience</span> into a publishing empire.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed px-2">
          Host premium blogs on your own branded instance. Automate DMs to drive traffic directly from your Reels. Monetize effortlessly with pre-integrated ad networks.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="w-full sm:w-auto text-base font-bold bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
            Start Building for Free <ArrowRight size={20} />
          </Link>
          <Link to="/login" className="w-full sm:w-auto text-base font-bold bg-white text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-full hover:border-gray-900 transition-colors text-center">
            Go to Dashboard
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need to scale.</h2>
            <p className="text-gray-600 text-lg">We provide the infrastructure, you provide the content.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Globe size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Your Own Instance</h3>
              <p className="text-gray-600 leading-relaxed">
                Get a dedicated subdomain instantly. Host beautifully formatted, SEO-optimized articles and blogs without touching a single line of code.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <InstagramIcon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Instagram Auto-DM</h3>
              <p className="text-gray-600 leading-relaxed">
                <strong>Free, unlimited Auto-DMs.</strong> Connect your Instagram account and automatically DM links to followers who comment. Naturally blends with your existing content to maximize conversions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <DollarSign size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Built-in Monetization</h3>
              <p className="text-gray-600 leading-relaxed">
                No need to struggle with AdSense approvals. Our platform injects premium global ads automatically. You write, we handle the revenue share.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How It Works & Safety</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Everything you need to know about earning passive income safely.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* FAQ 1 */}
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Is this safe for my Instagram account?</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Yes, 100%. Our platform is strictly built using the official Meta API and is fully Meta-verified. We automatically manage rate limits, queues, and delays to ensure your account complies perfectly with Instagram's anti-spam policies, keeping your account perfectly safe even if a Reel goes incredibly viral.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">How exactly do I earn passive income?</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Most creators hurt their engagement by auto-DMing direct spammy links. Instead, our system lets you create beautifully branded mini-blogs. Your Auto DMs send fans to your blog post (which contains your target link), but because our platform automatically injects premium ads into your blog, you earn passive income on every single click. It blends perfectly and naturally with your content!
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-4 md:mx-auto px-6 text-center bg-black text-white py-12 md:py-16 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-50"></div>
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-30"></div>
          
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 md:mb-6 relative z-10">Ready to own your audience?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto relative z-10">
            Join thousands of creators who are already monetizing their traffic independently.
          </p>
          <Link to="/register" className="inline-flex text-lg font-bold bg-blue-600 text-white px-10 py-5 rounded-full hover:bg-blue-500 transition-colors items-center gap-2 relative z-10">
            Create Your Instance <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <Logo size="sm" className="opacity-80 grayscale" />
          
          <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6 text-sm font-medium text-gray-500">
            <Link to="/support" className="hover:text-gray-900 transition-colors">Support</Link>
            <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
            <Link to="/data-deletion" className="hover:text-gray-900 transition-colors">Data Deletion</Link>
          </div>

          <p className="text-sm text-gray-400 font-medium">
            © {new Date().getFullYear()} Creator Instance.
          </p>
        </div>
      </footer>
    </div>
  );
};
