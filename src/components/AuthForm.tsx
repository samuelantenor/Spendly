import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const returnTo = location.state?.returnTo || '/';
  const locationMessage = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error: magicLinkError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (magicLinkError) throw magicLinkError;

        showToast({
          title: "Check your email! 📧",
          description: "We've sent you a magic link to reset your password. Once logged in, you can change your password in Settings.",
          type: "success",
          duration: 6000,
        });
        setEmail('');
        return;
      }

      if (isLogin) {
        await signIn(email, password);
        showToast({
          title: "Welcome back! 👋",
          description: "Successfully signed in to your account.",
          type: "success",
          duration: 3000,
        });
        navigate(returnTo);
      } else {
        try {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`
            }
          });
          
          if (signUpError) throw signUpError;
          
          showToast({
            title: "Welcome to Spendly! 🎉",
            description: "Your account has been created successfully. Please check your email to confirm your registration.",
            type: "success",
            duration: 6000,
          });
          setIsLogin(true);
          setEmail('');
          setPassword('');
          setMessage('Please check your email to confirm your account before signing in.');
        } catch (err) {
          console.error('Signup error:', err);
          const errorMessage = err instanceof Error ? err.message : 'An error occurred';
          setError(errorMessage);
          showToast({
            title: "Signup Failed",
            description: errorMessage,
            type: "error",
            duration: 5000,
          });
        }
      }
    } catch (err) {
      console.error('Form submission error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      showToast({
        title: isLogin ? "Login Failed" : "Signup Failed",
        description: errorMessage,
        type: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isForgotPassword 
              ? "Reset your password"
              : isLogin 
                ? "Sign in to your account" 
                : "Create your account"}
          </h2>
          {isForgotPassword && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email and we'll send you a magic link to sign in and reset your password
            </p>
          )}
        </div>

        {(error || message || locationMessage) && (
          <div className={`rounded-md p-4 ${error ? 'bg-red-50' : 'bg-green-50'}`}>
            <p className={`text-sm ${error ? 'text-red-800' : 'text-green-800'}`}>
              {error || message || locationMessage}
            </p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {!isForgotPassword && (
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setIsForgotPassword(false);
                  setError('');
                  setMessage('');
                }}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
            {isLogin && !isForgotPassword && (
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError('');
                    setMessage('');
                  }}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </button>
              </div>
            )}
            {isForgotPassword && (
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError('');
                    setMessage('');
                  }}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Back to sign in
                </button>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Processing..." : (
                isForgotPassword 
                  ? "Send Magic Link"
                  : isLogin 
                    ? "Sign in" 
                    : "Sign up"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}