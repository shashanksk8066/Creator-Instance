import { useState, useEffect } from 'react';

export const About = () => {
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const res = await fetch('/api/public/creator');
        if (res.ok) setCreator(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCreator();
  }, []);

  if (loading) return <div className="p-12 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100">
        
        {/* Creator Profile Section */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">About</h1>
        
        {creator?.about && (
          <div className="prose prose-blue max-w-none mb-10 text-gray-600">
            <p className="whitespace-pre-wrap">{creator.about}</p>
          </div>
        )}

        {(creator?.contactEmail || (creator?.socialLinks && Object.keys(creator.socialLinks).length > 0)) && (
          <div className="mb-12">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Connect with {creator?.fullName || 'the Author'}</h2>
            <div className="flex flex-col gap-3">
              {creator?.contactEmail && (
                <a href={`mailto:${creator.contactEmail}`} className="text-blue-600 font-medium hover:underline w-fit">
                  {creator.contactEmail}
                </a>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 my-8"></div>

        {/* Platform Disclaimer Section */}
        <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Platform Disclaimer & Content Liability</h2>
          
          <div className="space-y-6 text-gray-600 leading-relaxed text-sm">
            <p>
            <strong>Ownership of Content:</strong> The content published on this website, including blogs, text, images, videos, downloadable resources, and other media, is solely owned, created, and managed by <strong className="text-gray-900">{creator?.fullName || 'the Creator'}</strong>. 
          </p>

          <p>
            <strong>Our Role:</strong> This website is hosted and powered by <strong className="text-blue-600 font-semibold">Creator Instance</strong>. Creator Instance is a specialized Software-as-a-Service (SaaS) platform that provides influencers and creators with the infrastructure to easily build custom blogs, monetize traffic through automated ad placements, and automate Instagram direct messaging. 
          </p>

          <p>
            <strong>No Endorsement:</strong> Because Creator Instance acts as a technology and hosting provider, Creator Instance does not create, edit, or endorse the content published on this subdomain. While we reserve the right to moderate content, <strong className="text-gray-900">Creator Instance does not routinely verify the accuracy, completeness, or legality of the statements, claims, advice, or media shared by the creator.</strong> 
          </p>
          
          <p>
            If a creator publishes content that is illegal, defamatory, infringes on intellectual property, or otherwise violates applicable laws, the creator (<strong className="text-gray-900">{creator?.fullName || 'the Author'}</strong>) assumes primary responsibility for their publications to the fullest extent permitted by applicable law. 
          </p>

            <div className="mt-8 p-6 bg-blue-50/80 border border-blue-100 rounded-xl">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Legal Inquiries</h3>
            <p className="text-sm text-gray-600">
              If you have inquiries, complaints, or legal concerns regarding the specific content published on this page, please contact the creator directly at <a href={`mailto:${creator?.contactEmail || creator?.email}`} className="text-blue-600 hover:underline font-medium">{creator?.contactEmail || creator?.email}</a>.
            </p>
            <p className="text-sm text-gray-600 mt-3">
              For platform-related issues concerning Creator Instance, please contact our official support channels.
            </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
