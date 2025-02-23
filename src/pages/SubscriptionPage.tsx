import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, LogOut, Heart, Trophy, Brain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { usePaymentSuccess } from '../hooks/usePaymentSuccess';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  duration_months: number;
}

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchPlans();
  }, [user, navigate]);

  usePaymentSuccess();

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price')
        .limit(1); // Only fetch one plan

      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setProcessing(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            priceId: 'price_1QuqCSEOlLSuDFhpHjOwuIjX',
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('Failed to process subscription. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <Heart className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-2 text-3xl font-bold text-gray-900">Join Our Healing Journey</h2>
          <p className="mt-4 text-lg text-gray-500">
            Take the first step towards mindful spending and emotional well-being
          </p>
        </div>

        {error && (
          <div className="mt-8 max-w-md mx-auto bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-12 max-w-md mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">Mindful Shopping Guide</h3>
                <p className="mt-4 text-sm text-gray-500">
                  Your companion in developing healthier shopping habits
                </p>
                <p className="mt-8">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-base font-medium text-gray-500">/mo</span>
                </p>
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={processing}
                  className="mt-8 block w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Start Your Journey'}
                </button>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">
                  How We Help You
                </h4>
                <ul className="mt-6 space-y-4">
                  <li className="flex space-x-3">
                    <Heart className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500">Safe environment to practice mindful shopping</span>
                  </li>
                  <li className="flex space-x-3">
                    <Trophy className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500">Track your progress and celebrate victories</span>
                  </li>
                  <li className="flex space-x-3">
                    <Brain className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500">Learn to identify emotional spending triggers</span>
                  </li>
                  <li className="flex space-x-3">
                    <Shield className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500">Build healthy shopping boundaries</span>
                  </li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}