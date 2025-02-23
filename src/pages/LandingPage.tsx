import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Brain, 
  Shield, 
  Heart, 
  ArrowRight, 
  ChevronDown,
  Star,
  Clock,
  Trophy,
  CheckCircle,
  DollarSign,
  Smile,
  ShoppingCart,
  Coins,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface RecentPurchase {
  id: string;
  user_email: string;
  product_name: string;
  product_image: string;
  original_price: number;
  savings: number;
  emotional_trigger: string;
  created_at: string;
}

const anonymizeEmail = (email: string) => {
  const [username] = email.split('@');
  return `${username.slice(0, 2)}${'*'.repeat(username.length - 2)}`;
};

const faqs = [
  {
    question: "How does Spendly work?",
    answer: "Spendly helps you develop mindful shopping habits by providing a safe environment to practice making purchase decisions. Track your impulses, earn rewards, and learn to make smarter financial choices."
  },
  {
    question: "Is it really free?",
    answer: "Yes! Start with our 7-day free trial to experience all features. No credit card required during the trial period."
  },
  {
    question: "How do I earn points?",
    answer: "Earn points by making mindful shopping decisions, maintaining shopping-free streaks, and achieving personal savings goals."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely! You can cancel your subscription at any time with no questions asked."
  }
];

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    role: "Mindful Shopper",
    content: "Spendly has completely changed my relationship with shopping. I've saved over $2,000 in just three months!"
  },
  {
    id: 2,
    name: "Michael R.",
    role: "Recovery Journey",
    content: "The emotional tracking feature helped me understand my spending triggers. Now I can make more conscious decisions."
  },
  {
    id: 3,
    name: "Emily T.",
    role: "Student",
    content: "As a student, the points system makes saving money feel like a game. It's actually fun to be financially responsible!"
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/home');
      return;
    }

    fetchRecentPurchases();
  }, [user, navigate]);

  const fetchRecentPurchases = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_recent_purchases', { limit_count: 3 });

      if (error) throw error;
      setRecentPurchases(data || []);
    } catch (err) {
      console.error('Error fetching recent purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderNavbar = () => (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <ShoppingCart className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">Spendly</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/about" className="text-white hover:text-indigo-200 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-white hover:text-indigo-200 transition-colors">
              Contact
            </Link>
            <Link
              to="/auth"
              className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-50 transition-colors"
            >
              Sign In
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-indigo-200 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white rounded-lg mt-2 py-2 shadow-lg">
            <Link
              to="/about"
              className="block px-4 py-2 text-gray-700 hover:bg-indigo-50"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block px-4 py-2 text-gray-700 hover:bg-indigo-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              to="/auth"
              className="block px-4 py-2 text-indigo-600 hover:bg-indigo-50 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );

  const renderRecentPurchases = () => (
    <div className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Feel Free to Splurge
          </h2>
          <p className="text-xl text-gray-600">
            Fulfill your shopping urges in a safe, controlled environment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-square bg-gray-200" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : recentPurchases.length > 0 ? (
            recentPurchases.map((purchase) => (
              <div key={purchase.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={purchase.product_image}
                    alt={purchase.product_name}
                    className="w-full h-full object-cover"
                  />
                  {purchase.savings > 0 && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Saved ${purchase.savings.toFixed(2)}
                    </div>
                  )}
                  {purchase.emotional_trigger && (
                    <div className="absolute bottom-2 left-2 bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-gray-700 flex items-center">
                      <Smile className="h-4 w-4 mr-1" />
                      {purchase.emotional_trigger}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {purchase.product_name}
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <span className="text-lg font-semibold text-gray-900">
                        ${purchase.original_price.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      purchased by {anonymizeEmail(purchase.user_email)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500">No purchases to display yet. Be the first to make a purchase!</p>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/auth')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Start Shopping Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-indigo-800">
      {renderNavbar()}

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`cart-${i}`}
                initial={{ 
                  opacity: 0,
                  x: -200,
                  y: Math.random() * window.innerHeight,
                  scale: 0.5
                }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  x: window.innerWidth + 200,
                  y: [
                    Math.random() * window.innerHeight,
                    Math.random() * window.innerHeight,
                    Math.random() * window.innerHeight
                  ],
                  scale: [0.5, 1.5, 1.5, 0.5],
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 15 + Math.random() * 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute text-white/30"
              >
                <ShoppingCart className="h-12 w-12" />
              </motion.div>
            ))}

            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`dollar-${i}`}
                initial={{ 
                  opacity: 0,
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 100,
                  scale: 0.5
                }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  x: [
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerWidth
                  ],
                  y: -200,
                  scale: [0.5, 2, 2, 0.5],
                  rotate: [-30, 30]
                }}
                transition={{ 
                  duration: 12 + Math.random() * 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute text-yellow-400/40"
              >
                <DollarSign className="h-10 w-10" />
              </motion.div>
            ))}

            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`coin-${i}`}
                initial={{ 
                  opacity: 0,
                  x: window.innerWidth + 200,
                  y: Math.random() * window.innerHeight,
                  scale: 0.5
                }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  x: -200,
                  y: [
                    Math.random() * window.innerHeight,
                    Math.random() * window.innerHeight,
                    Math.random() * window.innerHeight
                  ],
                  scale: [0.5, 1.8, 1.8, 0.5],
                  rotate: [0, 720]
                }}
                transition={{ 
                  duration: 18 + Math.random() * 12,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute text-yellow-500/30"
              >
                <Coins className="h-14 w-14" />
              </motion.div>
            ))}

            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`smile-${i}`}
                initial={{ 
                  opacity: 0,
                  x: Math.random() * window.innerWidth,
                  y: -200,
                  scale: 0.5
                }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  x: [
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerWidth
                  ],
                  y: window.innerHeight + 200,
                  scale: [0.5, 1.6, 1.6, 0.5],
                  rotate: [-20, 20, -20]
                }}
                transition={{ 
                  duration: 20 + Math.random() * 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute text-white/30"
              >
                <Smile className="h-12 w-12" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl opacity-10"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl opacity-10"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center relative z-10"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl sm:text-7xl font-bold text-white mb-6"
          >
            Never Pay Full Price
            <br />
            <span className="text-yellow-400">for Impulse Buys</span>
            <br />
            again
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl text-indigo-100 max-w-2xl mx-auto mb-12"
          >
            We help you develop mindful shopping habits while saving money. 
            Track your impulses, earn rewards, and make smarter financial decisions.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
          >
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-yellow-400 text-indigo-900 rounded-lg hover:bg-yellow-300 transition-colors font-medium text-lg flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/about')}
              className="px-8 py-4 bg-white bg-opacity-10 text-white rounded-lg hover:bg-opacity-20 transition-colors font-medium text-lg"
            >
              Learn More
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-indigo-100"
          >
            <span>✓ 7-Day Free Trial</span>
            <span className="hidden sm:inline">•</span>
            <span>✓ Cancel Anytime</span>
            <span className="hidden sm:inline">•</span>
            <span>✓ No Credit Card Required</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <ChevronDown className="h-8 w-8 text-white animate-bounce" />
          </motion.div>
        </motion.div>
      </div>

      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Your journey to mindful shopping starts here</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-indigo-50 rounded-xl p-8 text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Track Impulses</h3>
              <p className="text-gray-600">
                Identify emotional triggers and develop awareness of your shopping patterns
              </p>
            </div>

            <div className="bg-indigo-50 rounded-xl p-8 text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Safe Practice</h3>
              <p className="text-gray-600">
                Make purchase decisions in a risk-free environment with virtual money
              </p>
            </div>

            <div className="bg-indigo-50 rounded-xl p-8 text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Earn Rewards</h3>
              <p className="text-gray-600">
                Get points and achievements for making mindful shopping decisions
              </p>
            </div>
          </div>
        </div>
      </div>

      {renderRecentPurchases()}

      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied Spendly users</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-indigo-50 rounded-xl p-8">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-indigo-600">{testimonial.role}</p>
                </div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about Spendly</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transform transition-transform ${
                      activeAccordion === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeAccordion === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-indigo-600 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Ready to Transform Your Shopping Habits?
          </h2>
          <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
            Join thousands of users who have already saved money and developed healthier shopping habits with Spendly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg"
            >
              Start Your Free Trial
            </button>
            <button
              onClick={() => navigate('/about')}
              className="px-8 py-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition-colors font-medium text-lg"
            >
              Learn More
            </button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-8 text-indigo-100">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>7-Day Free Trial</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingCart className="h-8 w-8 text-indigo-600" />
                <span className="text-xl font-bold text-gray-900">Spendly</span>
              </div>
              <p className="text-gray-600 mb-4 max-w-md">
                Your companion in developing mindful shopping habits. Make smarter financial 
                decisions in a safe, supportive environment.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-gray-600 hover:text-indigo-600">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-gray-600 hover:text-indigo-600">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/auth" state={{ isLogin: false }} className="text-gray-600 hover:text-indigo-600">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Support
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/privacy" className="text-gray-600 hover:text-indigo-600">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-600 hover:text-indigo-600">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 hover:text-indigo-600">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2 text-gray-500 text-sm">
                <Shield className="h-4 w-4" />
                <span>Your data is protected by industry-leading security measures</span>
              </div>
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Spendly. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}