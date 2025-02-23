import React from 'react';
import { Trophy, Coins, Calendar, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { UserStats as UserStatsType } from '../types';

interface UserStatsProps {
  stats: UserStatsType;
}

export default function UserStats({ stats }: UserStatsProps) {
  const { user } = useAuth();
  const [remainingBudget, setRemainingBudget] = React.useState<number | null>(null);

  React.useEffect(() => {
    async function fetchRemainingBudget() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .rpc('get_remaining_budget', { user_id: user.id });

        if (error) throw error;
        setRemainingBudget(data);
      } catch (err) {
        console.error('Error fetching remaining budget:', err);
      }
    }

    fetchRemainingBudget();

    // Subscribe to orders to update remaining budget
    const channel = supabase
      .channel('budget_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchRemainingBudget();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Points Card */}
      <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow min-h-[120px]">
        <div className="flex items-center h-full">
          <div className="p-2 bg-indigo-100 rounded-lg mr-3">
            <Trophy className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500 truncate">Points</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">{stats.points}</p>
          </div>
        </div>
      </div>

      {/* Fake Spent Card */}
      <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow min-h-[120px]">
        <div className="flex items-center h-full">
          <div className="p-2 bg-green-100 rounded-lg mr-3">
            <Coins className="h-6 w-6 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500 truncate">Fake Spent</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">
              ${stats.total_spent.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Current Streak Card */}
      <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow min-h-[120px]">
        <div className="flex items-center h-full">
          <div className="p-2 bg-purple-100 rounded-lg mr-3">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500 truncate">Current Streak</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">
              {stats.current_streak} days
            </p>
          </div>
        </div>
      </div>

      {/* Budget Left Card */}
      <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow min-h-[120px]">
        <div className="flex items-center h-full">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <Wallet className="h-6 w-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500 truncate">Budget Left</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">
              ${remainingBudget !== null ? remainingBudget.toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}