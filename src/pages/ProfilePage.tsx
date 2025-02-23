import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import UserStats from '../components/UserStats';
import AchievementsList from '../components/AchievementsList';
import Leaderboard from '../components/Leaderboard';
import WishlistPreview from '../components/WishlistPreview';
import type { Achievement, UserStats as UserStatsType } from '../types';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStatsType | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    async function fetchUserData() {
      try {
        // Fetch user stats
        const { data: statsData } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Fetch user achievements
        const { data: achievementsData } = await supabase
          .from('user_achievements')
          .select(`
            achievement:achievements (
              id,
              name,
              description,
              icon,
              points
            ),
            earned_at
          `)
          .eq('user_id', user.id);

        if (statsData) {
          setStats(statsData);
        }

        if (achievementsData) {
          const formattedAchievements = achievementsData.map(item => ({
            ...item.achievement,
            earned_at: item.earned_at
          }));
          setAchievements(formattedAchievements);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">No stats available yet. Start shopping!</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Stats</h2>
            <UserStats stats={stats} />
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Wishlist</h2>
            <WishlistPreview userId={user.id} />
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Achievements</h2>
            {achievements.length > 0 ? (
              <AchievementsList achievements={achievements} />
            ) : (
              <p className="text-center text-gray-500 py-8">
                No achievements yet. Keep shopping to earn badges!
              </p>
            )}
          </section>
        </div>

        <div className="lg:col-span-1">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}