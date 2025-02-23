import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Home, 
  History, 
  User, 
  LogOut, 
  Settings, 
  Menu, 
  X, 
  Shield, 
  Trophy, 
  BarChart,
  Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CartIcon from './CartIcon';
import PointsDisplay from './PointsDisplay';

export default function Navbar() {
  const { user, signOut, hasActiveSubscription } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <ShoppingCart className="h-8 w-8 text-indigo-600" />
                <span className="text-xl font-bold text-gray-800">Spendly</span>
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                to="/auth"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (!hasActiveSubscription) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-8 w-8 text-indigo-600" />
                <span className="text-xl font-bold text-gray-800">Spendly</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const navigationItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/analytics', icon: BarChart, label: 'Analytics' },
    { path: '/wishlist', icon: Heart, label: 'Wishlist' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    ...(user.email === 'admin@admin.com' ? [{ path: '/admin', icon: Shield, label: 'Admin' }] : []),
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/home" className="flex items-center space-x-2">
              <ShoppingCart className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-800">Spendly</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            <PointsDisplay />
            <CartIcon />
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <CartIcon />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="py-4">
              {/* Points Display in Mobile Menu */}
              <div className="px-4 py-3 bg-indigo-50 mb-2">
                <PointsDisplay showMobile />
              </div>
              
              {/* Navigation Items */}
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}