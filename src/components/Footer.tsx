import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Shield, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Footer() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand and Description */}
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

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {user ? (
                <>
                  <li>
                    <Link to="/home" className="text-gray-600 hover:text-indigo-600">
                      Shop
                    </Link>
                  </li>
                  <li>
                    <Link to="/wishlist" className="text-gray-600 hover:text-indigo-600">
                      Wishlist
                    </Link>
                  </li>
                  <li>
                    <Link to="/history" className="text-gray-600 hover:text-indigo-600">
                      Order History
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="text-gray-600 hover:text-indigo-600">
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/analytics" className="text-gray-600 hover:text-indigo-600">
                      Analytics
                    </Link>
                  </li>
                </>
              ) : (
                <>
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
                </>
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-indigo-600">
                  About Us
                </Link>
              </li>
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
                <Link to="/contact" className="text-gray-600 hover:text-indigo-600 flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <Shield className="h-4 w-4" />
              <span>Your data is protected by industry-leading security measures</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {currentYear} Spendly. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}