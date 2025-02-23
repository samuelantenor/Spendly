/*
  # Fix points calculation for achievements

  1. Changes
    - Add function to update user points when achievement is earned
    - Add trigger to automatically add achievement points to user total
    - Fix points calculation in existing trigger

  2. Security
    - Maintain existing RLS policies
    - Functions run with SECURITY DEFINER to ensure proper access
*/

-- Function to add achievement points to user total
CREATE OR REPLACE FUNCTION add_achievement_points()
RETURNS trigger AS $$
DECLARE
  achievement_points integer;
BEGIN
  -- Get points for the earned achievement
  SELECT points INTO achievement_points
  FROM achievements
  WHERE id = NEW.achievement_id;

  -- Add points to user's total
  UPDATE user_stats
  SET 
    points = points + achievement_points,
    updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to add points when achievement is earned
CREATE TRIGGER add_achievement_points_trigger
  AFTER INSERT ON user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION add_achievement_points();

-- Update the existing stats update function to handle points correctly
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