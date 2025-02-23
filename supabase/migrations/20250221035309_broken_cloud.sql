/*
  # Fix leaderboard relations

  1. Changes
    - Add foreign key constraint between leaderboard_entries and user_profiles
    - Add unique constraint on user_id to prevent duplicates
    - Update leaderboard function to handle user profile data
*/

-- Add unique constraint to prevent duplicate entries per user
ALTER TABLE leaderboard_entries
ADD CONSTRAINT leaderboard_entries_user_id_key UNIQUE (user_id);

-- Update leaderboard query function to use auth.users instead of user_profiles
CREATE OR REPLACE FUNCTION get_leaderboard_with_user_info(limit_count integer DEFAULT 10)
RETURNS TABLE (
  user_id uuid,
  points integer,
  rank integer,
  email text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    le.user_id,
    le.points,
    le.rank,
    au.email
  FROM leaderboard_entries le
  JOIN auth.users au ON le.user_id = au.id
  ORDER BY le.rank ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;