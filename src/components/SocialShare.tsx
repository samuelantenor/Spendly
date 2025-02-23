import React from 'react';
import { Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Achievement } from '../types';

interface SocialShareProps {
  achievement?: Achievement;
  points?: number;
}

export default function SocialShare({ achievement, points }: SocialShareProps) {
  const { user } = useAuth();

  const handleShare = async () => {
    if (!user) return;

    try {
      let shareText = '';

      if (achievement) {
        shareText = `I just earned the "${achievement.name}" achievement on Impulse Manager! 🎉`;
      } else if (points) {
        shareText = `I've saved ${points} points on Impulse Manager! 💰`;
      }

      // Record the share
      if (achievement) {
        await supabase
          .from('social_shares')
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
            share_type: 'generic'
          });
      }

      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'Spendly Achievement',
          text: shareText,
          url: window.location.origin
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareText}\n${window.location.origin}`);
        alert('Share text copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-full text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
    >
      <Share2 className="h-4 w-4 mr-1" />
      Share
    </button>
  );
}