import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Brain, Target, Shield, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Spendly</h1>
          <p className="text-xl text-gray-600">
            Your companion in the journey towards mindful spending and emotional well-being
          </p>
        </div>

        {/* Mission Statement */}
        <section className="bg-white rounded-2xl p-8 shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            Spendly isn't just another shopping app – it's a therapeutic tool designed to help individuals struggling with 
            shopping addiction and impulsive buying behaviors. We provide a safe, controlled environment where you can 
            practice making mindful purchasing decisions while developing healthier spending habits.
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How Spendly Helps</h2>
          <div className="grid gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Brain className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Mindful Decision Making</h3>
                  <p className="text-gray-600">
                    Practice making purchasing decisions in a controlled environment. Our platform helps you 
                    identify emotional triggers and develop strategies to manage impulsive buying urges.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Target className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Tracking</h3>
                  <p className="text-gray-600">
                    Monitor your journey with our comprehensive tracking system. Celebrate your victories 
                    and learn from your experiences as you build healthier shopping habits.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Heart className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Supportive Environment</h3>
                  <p className="text-gray-600">
                    Experience shopping in a judgment-free space designed to help you understand your 
                    relationship with spending while developing healthier financial habits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white rounded-2xl p-8 shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-indigo-600" />
              <span className="text-gray-600">Safe environment to practice mindful shopping</span>
            </li>
            <li className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-indigo-600" />
              <span className="text-gray-600">Emotional trigger identification tools</span>
            </li>
            <li className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-indigo-600" />
              <span className="text-gray-600">Progress tracking and achievement system</span>
            </li>
            <li className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-indigo-600" />
              <span className="text-gray-600">Mindful shopping exercises and challenges</span>
            </li>
          </ul>
        </section>

        {/* Call to Action */}
        <div className="text-center bg-indigo-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-600 mb-6">
            Join Spendly today and take the first step towards mindful spending.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 