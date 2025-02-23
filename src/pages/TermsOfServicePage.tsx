import React from 'react';
import { FileText, UserCheck, AlertTriangle, ShieldCheck, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <FileText className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-lg text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-indigo max-w-none">
        <section className="mb-12">
          <div className="flex items-center mb-4">
            <UserCheck className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Acceptance of Terms</h2>
          </div>
          <p className="text-gray-600">
            By accessing and using Spendly, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="mb-12">
          <div className="flex items-center mb-4">
            <Scale className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">User Responsibilities</h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">
              You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Maintaining the confidentiality of your account</li>
              <li>All activities that occur under your account</li>
              <li>Ensuring your account information is accurate</li>
              <li>Notifying us of any unauthorized use of your account</li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Prohibited Activities</h2>
          </div>
          <p className="text-gray-600 mb-4">
            You agree not to engage in any of the following activities:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Using the service for any unlawful purpose</li>
            <li>Attempting to gain unauthorized access to any part of the service</li>
            <li>Interfering with or disrupting the service</li>
            <li>Impersonating any person or entity</li>
            <li>Collecting user information without consent</li>
          </ul>
        </section>

        <section className="mb-12">
          <div className="flex items-center mb-4">
            <ShieldCheck className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Intellectual Property</h2>
          </div>
          <p className="text-gray-600 mb-4">
            The service and its original content, features, and functionality are owned by Spendly and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
          <p className="text-gray-600 mb-4">
            We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
          <p className="text-gray-600 mb-4">
            In no event shall Spendly, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Your access to or use of or inability to access or use the service</li>
            <li>Any conduct or content of any third party on the service</li>
            <li>Any content obtained from the service</li>
            <li>Unauthorized access, use or alteration of your transmissions or content</li>
          </ul>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600">
            If you have any questions about these Terms, please{' '}
            <Link to="/contact" className="text-indigo-600 hover:text-indigo-500">
              contact us through our contact form
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
}