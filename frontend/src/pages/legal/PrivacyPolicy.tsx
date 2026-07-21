import React from 'react';
import { Logo } from '../../components/Logo';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <nav className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/">
             <Logo size="md" />
          </Link>
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black mb-8">Privacy Policy</h1>
        <p className="text-gray-600 mb-6">Last Updated: 21 July 2026</p>
        
        <div className="prose prose-blue max-w-none text-gray-700">
          <p className="mb-8 text-lg">
            Creator Instance ("we", "our", or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, how we protect it, and your rights when using our services.
          </p>
          <p className="mb-8 text-lg">
            By using Creator Instance, you agree to the practices described in this Privacy Policy.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">1. Information We Collect</h2>
          <p className="mb-4">When you connect your Instagram Business or Creator account to Creator Instance, we may collect the following information after you authorize access through Meta Login:</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">Account Information</h3>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Instagram User ID</li>
            <li>Instagram username</li>
            <li>Profile picture</li>
            <li>Connected Facebook Page information (when required by Meta)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">Automation Data</h3>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Auto-DM keyword rules</li>
            <li>Automated message templates</li>
            <li>Automation settings and preferences</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">Meta Platform Data</h3>
          <p className="mb-4">When required to provide our services, we may access:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Comments on your Instagram posts that trigger automation rules</li>
            <li>Information necessary to send Direct Messages through the Instagram Messenger API</li>
          </ul>
          <p className="mb-8 font-medium text-gray-800">We only access the permissions that you explicitly authorize through Meta.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">2. How We Use Your Information</h2>
          <p className="mb-4">We use the collected information solely to provide the services you request, including:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Connecting your Instagram account</li>
            <li>Detecting comment keywords</li>
            <li>Sending automated Instagram Direct Messages on your behalf</li>
            <li>Displaying your connected account information within the dashboard</li>
            <li>Managing your automation settings</li>
            <li>Improving the reliability and security of our platform</li>
            <li>Providing customer support</li>
          </ul>
          <p className="mb-8 font-medium text-gray-800">We do not use your information for advertising or profiling.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">3. Information Sharing</h2>
          <p className="mb-4 font-medium text-gray-800">We do not sell, rent, or trade your personal information.</p>
          <p className="mb-4">Your information is shared only when necessary to:</p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Communicate with Meta's official Graph API and Instagram Messenger API</li>
            <li>Comply with applicable laws or legal obligations</li>
            <li>Protect the security and integrity of our platform</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">4. Data Storage and Security</h2>
          <p className="mb-4">We take reasonable technical and organizational measures to protect your information. These measures include:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Secure HTTPS connections</li>
            <li>Restricted server access</li>
            <li>Secure storage of access tokens</li>
            <li>Authentication and authorization controls</li>
            <li>Regular security updates</li>
          </ul>
          <p className="mb-8">Although we strive to protect your data, no method of transmission or storage is completely secure.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">5. Data Retention</h2>
          <p className="mb-4">We retain your information only for as long as necessary to provide our services.</p>
          <p className="mb-4">When you disconnect your Instagram account or request deletion:</p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Your Instagram access tokens are removed.</li>
            <li>Your automation settings are deleted.</li>
            <li>Your associated account information is permanently removed from our systems unless we are required by law to retain certain information.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">6. Your Rights</h2>
          <p className="mb-4">You may:</p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Disconnect your Instagram account at any time.</li>
            <li>Stop using Creator Instance whenever you choose.</li>
            <li>Request access to the information associated with your account.</li>
            <li>Request deletion of your stored data.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">7. Data Deletion</h2>
          <p className="mb-4">You may permanently delete your information by:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Disconnecting your Instagram account from the Creator Instance Dashboard.</li>
            <li>Following the instructions on our User Data Deletion page.</li>
            <li>Contacting our support team.</li>
          </ul>
          <p className="mb-8">Additional information is available on our <Link to="/data-deletion" className="text-blue-600 hover:underline">User Data Deletion Instructions</Link> page.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">8. Third-Party Services</h2>
          <p className="mb-4">Creator Instance uses third-party services necessary for providing its functionality, including:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Meta Graph API</li>
            <li>Instagram Messenger API</li>
            <li>Hosting and cloud infrastructure providers</li>
          </ul>
          <p className="mb-8">These services operate under their own privacy policies.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">9. Children's Privacy</h2>
          <p className="mb-4">Creator Instance is not intended for children under the age of 13.</p>
          <p className="mb-4">We do not knowingly collect personal information from children.</p>
          <p className="mb-8">If we become aware that such information has been collected, we will promptly delete it.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">10. Changes to this Privacy Policy</h2>
          <p className="mb-4">We may update this Privacy Policy from time to time.</p>
          <p className="mb-4">Any changes will be published on this page with an updated "Last Updated" date.</p>
          <p className="mb-8">Your continued use of Creator Instance after changes become effective constitutes acceptance of the updated Privacy Policy.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">11. Contact Us</h2>
          <p className="mb-4">If you have any questions regarding this Privacy Policy or your personal information, please contact us.</p>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-8">
            <h3 className="font-bold text-gray-900 mb-2">Creator Instance Support</h3>
            <p className="mb-1"><span className="font-medium">Email:</span> <a href="mailto:support@creatorinstance.in" className="text-blue-600 hover:underline">support@creatorinstance.in</a></p>
            <p><span className="font-medium">Website:</span> <a href="https://creatorinstance.in" className="text-blue-600 hover:underline">https://creatorinstance.in</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};
