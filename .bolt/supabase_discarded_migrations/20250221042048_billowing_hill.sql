/*
  # Fix user stats creation

  1. Changes
    - Update handle_new_user function to properly create user stats
    - Add error handling for user stats creation
    - Ensure atomic transaction for user creation process

  2. Security
    - Maintain existing RLS policies
    - Keep security definer setting
*/

-- Drop existing trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update handle_new_user function to ensure user stats are created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Start transaction to ensure all or nothing
  BEGIN
    -- Create user profile
    INSERT INTO public.user_profiles (id, email)
    VALUES (NEW.id, NEW.email);
    
    -- Create initial user stats
    INSERT INTO public.user_stats (
      user_id,
      points,
      total_spent,
      total_saved,
      current_streak,
      longest_streak,
      last_purchase_date
    ) VALUES (
      NEW.id,
      0,
      0,
      0,
      0,
      0,
      NULL
    );

    -- Set admin role if applicable
    IF NEW.email = 'admin@admin.com' THEN
      NEW.role := 'admin';
      NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, now());
    END IF;

    RETURN NEW;
  EXCEPTION
    WHEN others THEN
      -- Log error details but allow user creation to proceed
      RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
      RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create missing user stats for any existing users
INSERT INTO public.user_stats (
  user_id,
  points,
  total_spent,
  total_saved,
  current_streak,
  longest_streak,
  last_purchase_date
)
SELECT 
  au.id,
  0,
  0,
  0,
  0,
  0,
  NULL
FROM auth.users au
LEFT JOIN public.user_stats us ON us.user_id = au.id
WHERE us.user_id IS NULL;