/*
  # Add gamification features

  1. New Tables
    - `achievements` - Stores available achievements/badges
    - `user_achievements` - Links users to their earned achievements
    - `user_stats` - Stores user points, streaks, and other stats
  
  2. Changes
    - Add points calculation trigger on orders
    - Add achievement unlock triggers
    
  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  achievement_id uuid REFERENCES achievements(id) NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- User stats table
CREATE TABLE IF NOT EXISTS user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  points integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  total_saved numeric DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_purchase_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert initial achievements
INSERT INTO achievements (name, description, icon, points) VALUES
  ('First Purchase', 'Complete your first fake purchase', '🛍️', 10),
  ('Saving Star', 'Save $1000 in fake purchases', '💰', 50),
  ('Shopping Spree', 'Make 5 purchases in one day', '🔥', 30),
  ('Category Explorer', 'Purchase from 3 different categories', '🌟', 25),
  ('Streak Master', 'Maintain a 7-day purchase streak', '📅', 100);

-- Function to update user stats on purchase
CREATE OR REPLACE FUNCTION update_user_stats_on_purchase()
RETURNS trigger AS $$
DECLARE
  points_earned integer;
  last_purchase date;
BEGIN
  -- Calculate base points (1 point per dollar)
  points_earned := FLOOR(NEW.total_amount);
  
  -- Get user's last purchase date
  SELECT last_purchase_date INTO last_purchase
  FROM user_stats
  WHERE user_id = NEW.user_id;
  
  -- Update or create user stats
  INSERT INTO user_stats (
    user_id,
    points,
    total_spent,
    current_streak,
    last_purchase_date
  )
  VALUES (
    NEW.user_id,
    points_earned,
    NEW.total_amount,
    1,
    CURRENT_DATE
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    points = user_stats.points + points_earned,
    total_spent = user_stats.total_spent + NEW.total_amount,
    current_streak = CASE
      WHEN user_stats.last_purchase_date = CURRENT_DATE - 1 THEN user_stats.current_streak + 1
      WHEN user_stats.last_purchase_date = CURRENT_DATE THEN user_stats.current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(
      user_stats.longest_streak,
      CASE
        WHEN user_stats.last_purchase_date = CURRENT_DATE - 1 THEN user_stats.current_streak + 1
        WHEN user_stats.last_purchase_date = CURRENT_DATE THEN user_stats.current_streak
        ELSE 1
      END
    ),
    last_purchase_date = CURRENT_DATE,
    updated_at = now();

  -- Check and award achievements
  -- First Purchase
  IF NOT EXISTS (
    SELECT 1 FROM user_achievements
    WHERE user_id = NEW.user_id
    AND achievement_id = (SELECT id FROM achievements WHERE name = 'First Purchase')
  ) THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT NEW.user_id, id
    FROM achievements
    WHERE name = 'First Purchase';
  END IF;

  -- Saving Star
  IF (
    SELECT total_spent FROM user_stats WHERE user_id = NEW.user_id
  ) >= 1000 AND NOT EXISTS (
    SELECT 1 FROM user_achievements
    WHERE user_id = NEW.user_id
    AND achievement_id = (SELECT id FROM achievements WHERE name = 'Saving Star')
  ) THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT NEW.user_id, id
    FROM achievements
    WHERE name = 'Saving Star';
  END IF;

  -- Streak Master
  IF (
    SELECT current_streak FROM user_stats WHERE user_id = NEW.user_id
  ) >= 7 AND NOT EXISTS (
    SELECT 1 FROM user_achievements
    WHERE user_id = NEW.user_id
    AND achievement_id = (SELECT id FROM achievements WHERE name = 'Streak Master')
  ) THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT NEW.user_id, id
    FROM achievements
    WHERE name = 'Streak Master';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating stats on purchase
CREATE TRIGGER update_stats_on_purchase
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_purchase();