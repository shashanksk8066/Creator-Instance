import React from 'react';
import { Logo } from '../../components/Logo';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const TermsOfService = () => {
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
        <h1 className="text-4xl font-black mb-8">Terms of Service</h1>
        <p className="text-gray-600 mb-6">Last Updated: 21 July 2026</p>
        
        <div className="prose prose-blue max-w-none text-gray-700">
          <p className="mb-8 text-lg">
            Welcome to Creator Instance ("we", "our", or "us"). These Terms of Service ("Terms") govern your access to and use of the Creator Instance platform and services.
          </p>
          <p className="mb-8 text-lg">
            By creating an account or using our services, you agree to be bound by these Terms. If you do not agree with these Terms, you must not use our services.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">1. About Creator Instance</h2>
          <p className="mb-4">Creator Instance is a social media automation platform that enables Instagram Business and Creator accounts to automate Direct Messages based on comments using Meta's official Graph API and Instagram Messenger API.</p>
          <p className="mb-8 font-medium">Creator Instance is an independent software platform and is not affiliated with, endorsed by, or sponsored by Meta Platforms, Inc.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">2. Eligibility</h2>
          <p className="mb-4">To use Creator Instance, you must:</p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Be at least 18 years of age or have the legal authority to use the service.</li>
            <li>Own or have authorization to manage the connected Instagram Business or Creator account.</li>
            <li>Comply with all applicable laws, regulations, and Meta Platform Policies.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">3. Account Registration</h2>
          <p className="mb-4">To use certain features, you must create an account and connect your Instagram account through Meta Login.</p>
          <p className="mb-4">You are responsible for:</p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Maintaining the confidentiality of your account credentials.</li>
            <li>Ensuring the accuracy of the information you provide.</li>
            <li>All activities that occur under your account.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">4. Use of the Service</h2>
          <p className="mb-4">Creator Instance may be used only for lawful purposes.</p>
          <p className="mb-4">You agree to use the platform responsibly and in accordance with:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Meta Platform Terms</li>
            <li>Instagram Community Guidelines</li>
            <li>Applicable local laws</li>
          </ul>
          <p className="mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Send spam or unsolicited messages.</li>
            <li>Use automation for illegal, fraudulent, or abusive activities.</li>
            <li>Attempt to gain unauthorized access to our systems.</li>
            <li>Interfere with or disrupt the operation of the Service.</li>
            <li>Reverse engineer or misuse the platform.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">5. Instagram Integration</h2>
          <p className="mb-4">By connecting your Instagram account, you authorize Creator Instance to:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Access the permissions you grant through Meta Login.</li>
            <li>Read comments required for keyword detection.</li>
            <li>Send Direct Messages through the Instagram Messenger API.</li>
            <li>Store automation settings necessary to provide the Service.</li>
          </ul>
          <p className="mb-8 font-medium">You may revoke these permissions at any time through your Meta account settings or by disconnecting your account from Creator Instance.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">6. User Responsibilities</h2>
          <p className="mb-4">You are solely responsible for:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>The content of your automated messages.</li>
            <li>Compliance with Meta's Platform Policies.</li>
            <li>Compliance with applicable laws.</li>
            <li>Maintaining your account security.</li>
          </ul>
          <p className="mb-8 font-medium text-red-600">Creator Instance is not responsible for content created or sent by users.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">7. Service Availability</h2>
          <p className="mb-4">While we strive to provide reliable service, we do not guarantee uninterrupted availability.</p>
          <p className="mb-4">The Service may be temporarily unavailable due to:</p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Scheduled maintenance</li>
            <li>Meta API outages</li>
            <li>Network failures</li>
            <li>Third-party service interruptions</li>
            <li>Security updates</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">8. Intellectual Property</h2>
          <p className="mb-4">All software, logos, trademarks, designs, and content associated with Creator Instance are the property of Creator Instance unless otherwise stated.</p>
          <p className="mb-8">You may not copy, distribute, modify, or reproduce any part of the Service without prior written permission.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">9. Account Suspension or Termination</h2>
          <p className="mb-4">We reserve the right to suspend or terminate access to the Service if you:</p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Violate these Terms.</li>
            <li>Violate Meta Platform Policies.</li>
            <li>Engage in fraudulent, illegal, or abusive activities.</li>
            <li>Attempt to compromise the security or operation of the Service.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">10. Limitation of Liability</h2>
          <p className="mb-4">Creator Instance is provided on an "as is" and "as available" basis.</p>
          <p className="mb-4">To the fullest extent permitted by law, Creator Instance shall not be liable for:</p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Loss of profits</li>
            <li>Business interruption</li>
            <li>Data loss</li>
            <li>Instagram or Facebook account restrictions imposed by Meta</li>
            <li>Any indirect, incidental, or consequential damages arising from the use of the Service</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">11. Privacy</h2>
          <p className="mb-4">Your use of Creator Instance is also governed by our <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.</p>
          <p className="mb-8">Please review our Privacy Policy to understand how we collect, use, and protect your information.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">12. Changes to the Service</h2>
          <p className="mb-8">We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">13. Changes to These Terms</h2>
          <p className="mb-4">We may update these Terms from time to time.</p>
          <p className="mb-4">Updated versions will be published on this page with a revised "Last Updated" date.</p>
          <p className="mb-8">Your continued use of the Service after changes become effective constitutes acceptance of the revised Terms.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">14. Governing Law</h2>
          <p className="mb-4">These Terms shall be governed by and interpreted in accordance with the laws of India, without regard to its conflict of law principles.</p>
          <p className="mb-8">Any disputes arising under these Terms shall be subject to the jurisdiction of the competent courts in India.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-900">15. Contact Us</h2>
          <p className="mb-4">If you have any questions regarding these Terms, please contact us:</p>
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
