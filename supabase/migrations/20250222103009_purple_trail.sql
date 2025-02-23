/*
  # Update Streak Logic

  1. Changes
    - Initialize streak at 0 instead of 1
    - Reset streak to 0 instead of 1 when a day is missed
    - Update streak calculation logic in update_user_stats_on_purchase function

  2. Security
    - Maintains existing RLS policies
    - No changes to table structure or permissions
*/

-- Update the user stats update function with corrected streak logic
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
    0, -- Initialize streak at 0
    CURRENT_DATE
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    points = user_stats.points + points_earned,
    total_spent = user_stats.total_spent + NEW.total_amount,
    current_streak = CASE
      WHEN user_stats.last_purchase_date = CURRENT_DATE - 1 THEN user_stats.current_streak + 1
      WHEN user_stats.last_purchase_date = CURRENT_DATE THEN user_stats.current_streak
      ELSE 0 -- Reset to 0 when streak is broken
    END,
    longest_streak = GREATEST(
      user_stats.longest_streak,
      CASE
        WHEN user_stats.last_purchase_date = CURRENT_DATE - 1 THEN user_stats.current_streak + 1
        WHEN user_stats.last_purchase_date = CURRENT_DATE THEN user_stats.current_streak
        ELSE 0 -- Use 0 for consistency
      END
    ),
    last_purchase_date = CURRENT_DATE,
    updated_at = now();

  -- Check and award achievements (unchanged)
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

  -- Streak Master (now requires 7 consecutive days)
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