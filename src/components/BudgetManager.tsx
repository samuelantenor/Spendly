import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/use-toast';

interface Budget {
  id: string;
  amount: number;
  month: string;
}

export default function BudgetManager() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canSetBudget, setCanSetBudget] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchCurrentBudget();
  }, [user, navigate]);

  const fetchCurrentBudget = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the new function to get current budget
      const { data, error: rpcError } = await supabase
        .rpc('get_current_budget', { user_id: user?.id });

      if (rpcError) throw rpcError;

      if (data && data.length > 0) {
        setCurrentBudget(data[0]);
        setCanSetBudget(false);
      } else {
        setCurrentBudget(null);
        setCanSetBudget(true);
      }
    } catch (err) {
      console.error('Error fetching budget:', err);
      setError('Failed to load budget information');
      setCanSetBudget(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const amount = parseFloat(newBudgetAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid budget amount');
      }

      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      
      const { error: budgetError } = await supabase
        .from('user_budgets')
        .insert([
          {
            user_id: user?.id,
            amount,
            month: currentMonth
          }
        ]);

      if (budgetError) throw budgetError;

      toast({
        title: "Budget set successfully! 💰",
        description: `Your budget for ${new Date(currentMonth).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} has been set.`,
        duration: 5000,
      });

      // Refresh budget data
      fetchCurrentBudget();
      setNewBudgetAmount('');
    } catch (err) {
      console.error('Error setting budget:', err);
      setError(err instanceof Error ? err.message : 'Failed to set budget');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Monthly Budget</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {currentBudget ? (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Your budget for {new Date(currentBudget.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}:</p>
          <div className="flex items-center text-2xl font-bold text-indigo-600">
            <DollarSign className="h-6 w-6 mr-1" />
            {currentBudget.amount.toFixed(2)}
          </div>
          <p className="mt-4 text-sm text-gray-500">
            You can set a new budget at the beginning of next month.
          </p>
        </div>
      ) : canSetBudget ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
              Set your budget for {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="budget"
                min="0"
                step="0.01"
                value={newBudgetAmount}
                onChange={(e) => setNewBudgetAmount(e.target.value)}
                className="block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Set Budget
          </button>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600">
            Unable to load budget information. Please try again later.
          </p>
        </div>
      )}
    </div>
  );
}