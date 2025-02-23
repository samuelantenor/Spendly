import React from 'react';
import { Shield, Lock, Eye, Database, Cookie, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Shield className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-lg text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-indigo max-w-none">
        <section className="mb-12">
          <div className="flex items-center mb-4">
            <Lock className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
          </div>
          <p className="text-gray-600 mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Account information (email address, password)</li>
            <li>Profile information (name, shopping preferences)</li>
            <li>Transaction history and shopping patterns</li>
            <li>Communication preferences</li>
          </ul>
        </section>

        <section className="mb-12">
          <div className="flex items-center mb-4">
            <Eye className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
          </div>
          <p className="text-gray-600 mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process your transactions and track spending patterns</li>
            <li>Send you technical notices and support messages</li>
            <li>Analyze shopping behavior to provide personalized recommendations</li>
            <li>Detect and prevent fraudulent activity</li>
          </ul>
        </section>

        <section className="mb-12">
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Data Storage and Security</h2>
          </div>
          <p className="text-gray-600 mb-4">
            We implement appropriate technical and organizational security measures to protect your personal information against accidental or unlawful destruction, loss, alteration, unauthorized disclosure, or access.
          </p>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-indigo-700 font-medium">Security Measures Include:</p>
            <ul className="list-disc pl-6 text-indigo-600 mt-2">
              <li>End-to-end encryption for sensitive data</li>
              <li>Regular security audits and updates</li>
              <li>Secure data centers with 24/7 monitoring</li>
              <li>Employee access controls and training</li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center mb-4">
            <Cookie className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Cookies and Tracking</h2>
          </div>
          <p className="text-gray-600 mb-4">
            We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </section>

        <section className="mb-12">
          <div className="flex items-center mb-4">
            <Bell className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
          </div>
          <p className="text-gray-600 mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to data processing</li>
            <li>Request data portability</li>
          </ul>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600">
            If you have any questions about this Privacy Policy, please{' '}
            <Link to="/contact" className="text-indigo-600 hover:text-indigo-500">
              contact us through our contact form
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
}