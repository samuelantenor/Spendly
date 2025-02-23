import React from 'react';
import { Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface PointsDisplayProps {
  showMobile?: boolean;
}

export default function PointsDisplay({ showMobile = false }: PointsDisplayProps) {
  const { user } = useAuth();
  const [points, setPoints] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    async function fetchPoints() {
      try {
        const { data, error } = await supabase
          .from('user_stats')
          .select('points')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setPoints(data.points);
        }
      } catch (error) {
        console.error('Error fetching points:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPoints();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('points_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new) {
            setPoints(payload.new.points);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading || !user) return null;

  if (showMobile) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-indigo-600" />
          <span className="font-medium text-gray-900">Your Points</span>
        </div>
        <span className="text-lg font-bold text-indigo-600">{points} pts</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 bg-indigo-50 px-3 py-1 rounded-full">
      <Trophy className="h-4 w-4 text-indigo-600" />
      <span className="text-sm font-medium text-indigo-600">{points} pts</span>
    </div>
  );
}