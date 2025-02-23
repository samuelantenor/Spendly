/*
  # Fix Leaderboard Function Type Mismatch

  1. Changes
    - Update get_leaderboard_with_user_info function to handle email type correctly
    - Drop existing function to avoid conflicts
    - Recreate function with correct type handling
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_leaderboard_with_user_info(integer);

-- Recreate function with correct type handling
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
    CAST(au.email AS text) -- Explicitly cast email to text
  FROM leaderboard_entries le
  JOIN auth.users au ON le.user_id = au.id
  ORDER BY le.rank ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_leaderboard_with_user_info(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard_with_user_info(integer) TO service_role;