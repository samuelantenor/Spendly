import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  user_id: string;
  points: number;
  rank: number;
  email: string;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = React.useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchLeaderboard() {
      try {
        // Use RPC call to get leaderboard data
        const { data, error } = await supabase
          .rpc('get_leaderboard_with_user_info', { limit_count: 10 });

        if (error) throw error;

        if (data) {
          setEntries(data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();

    // Subscribe to leaderboard changes
    const channel = supabase
      .channel('leaderboard_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_entries'
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-indigo-600">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Trophy className="h-5 w-5 mr-2" />
          Top Savers
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {entries.map((entry, index) => (
          <div
            key={entry.user_id}
            className={`px-6 py-4 flex items-center ${
              entry.user_id === user?.id ? 'bg-indigo-50' : ''
            }`}
          >
            <div className="flex-shrink-0 w-8">
              {index === 0 ? (
                <Medal className="h-6 w-6 text-yellow-400" />
              ) : index === 1 ? (
                <Medal className="h-6 w-6 text-gray-400" />
              ) : index === 2 ? (
                <Medal className="h-6 w-6 text-amber-600" />
              ) : (
                <span className="text-gray-500 font-medium">{entry.rank}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {entry.user_id === user?.id ? 'You' : entry.email.split('@')[0]}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600">
                {entry.points} pts
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}