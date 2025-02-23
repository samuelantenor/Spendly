-- Reset all current streaks to 0 to match new logic
UPDATE user_stats
SET current_streak = 0
WHERE current_streak > 0;

-- Update the handle_new_user function to initialize streak at 0
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Create initial user stats with streak at 0
  INSERT INTO public.user_stats (
    user_id,
    points,
    total_spent,
    total_saved,
    current_streak,
    longest_streak
  ) VALUES (
    NEW.id,
    0,
    0,
    0,
    0, -- Initialize streak at 0
    0  -- Initialize longest streak at 0
  );

  -- Set admin role if applicable
  IF NEW.email = 'admin@admin.com' THEN
    NEW.role := 'admin';
    NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, now());
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;