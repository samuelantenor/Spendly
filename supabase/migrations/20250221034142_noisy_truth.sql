/*
  # Fix user stats initialization

  1. Changes
    - Update user creation trigger to initialize user_stats
    - Add default values for all user_stats columns
    - Ensure user_stats are created for existing users

  2. Security
    - Maintain existing RLS policies
    - Add update policy for user_stats
*/

-- Update the handle_new_user function to also create user_stats
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.user_profiles (id, email)
  VALUES (new.id, new.email);
  
  -- Create initial user stats
  INSERT INTO public.user_stats (
    user_id,
    points,
    total_spent,
    total_saved,
    current_streak,
    longest_streak
  ) VALUES (
    new.id,
    0,
    0,
    0,
    0,
    0
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user stats for any existing users that don't have them
INSERT INTO public.user_stats (
  user_id,
  points,
  total_spent,
  total_saved,
  current_streak,
  longest_streak
)
SELECT 
  id as user_id,
  0 as points,
  0 as total_spent,
  0 as total_saved,
  0 as current_streak,
  0 as longest_streak
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_stats);

-- Add update policy for user stats
CREATE POLICY "System can update user stats"
  ON user_stats
  FOR UPDATE
  USING (true)
  WITH CHECK (true);