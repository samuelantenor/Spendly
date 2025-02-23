/*
  # Add leaderboard and social features

  1. New Tables
    - `leaderboard_entries` - Tracks user rankings and scores
    - `social_shares` - Records user social sharing activity

  2. Security
    - Enable RLS on new tables
    - Add policies for reading and creating entries
*/

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  points integer NOT NULL DEFAULT 0,
  rank integer,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read leaderboard"
  ON leaderboard_entries
  FOR SELECT
  TO authenticated
  USING (true);

-- Social shares table
CREATE TABLE IF NOT EXISTS social_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  achievement_id uuid REFERENCES achievements(id),
  share_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create social shares"
  ON social_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own social shares"
  ON social_shares
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update leaderboard
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS trigger AS $$
BEGIN
  -- Insert or update leaderboard entry
  INSERT INTO leaderboard_entries (user_id, points)
  VALUES (NEW.user_id, NEW.points)
  ON CONFLICT (user_id) DO UPDATE
  SET points = NEW.points,
      updated_at = now();

  -- Update ranks for all users
  WITH ranked_users AS (
    SELECT
      id,
      user_id,
      points,
      ROW_NUMBER() OVER (ORDER BY points DESC) as new_rank
    FROM leaderboard_entries
  )
  UPDATE leaderboard_entries le
  SET rank = ru.new_rank
  FROM ranked_users ru
  WHERE le.id = ru.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update leaderboard when user stats change
CREATE TRIGGER update_leaderboard_trigger
  AFTER INSERT OR UPDATE OF points ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_leaderboard();