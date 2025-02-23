import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { AchievementProvider } from './contexts/AchievementContext';
import { ToastProvider } from './contexts/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthForm from './components/AuthForm';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import SubscriptionPage from './pages/SubscriptionPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import ContactPage from './pages/ContactPage';
import AnalyticsPage from './pages/AnalyticsPage';
import WishlistPage from './pages/WishlistPage';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { hasActiveSubscription } = useAuth();
  
  if (!hasActiveSubscription) {
    return <Navigate to="/subscribe" replace />;
  }

  return <>{children}</>;
}

function SubscriptionRoute({ children }: { children: React.ReactNode }) {
  const { hasActiveSubscription } = useAuth();
  
  if (hasActiveSubscription) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { user, hasActiveSubscription } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Only show Navbar on non-landing pages */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
                  <Routes>
                    <Route path="/auth" element={<AuthForm />} />
                    <Route path="/auth/callback" element={<AuthForm />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsOfServicePage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    );
  }

  return (
    <CartProvider>
      <AchievementProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
            <Routes>
              <Route path="/subscribe" element={<SubscriptionRoute><SubscriptionPage /></SubscriptionRoute>} />
              {hasActiveSubscription ? (
                <>
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsOfServicePage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  {user.email === 'admin@admin.com' && (
                    <Route path="/admin" element={<AdminDashboard />} />
                  )}
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </>
              ) : (
                <Route path="*" element={<Navigate to="/subscribe" replace />} />
              )}
            </Routes>
          </main>
          <Footer />
        </div>
      </AchievementProvider>
    </CartProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}