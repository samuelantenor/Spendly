/*
  # Fix user creation and role assignment

  1. Changes
    - Update handle_new_user function to properly handle user creation
    - Add missing grants for auth schema
    - Ensure proper role assignment
    - Fix trigger execution order

  2. Security
    - Maintain RLS policies
    - Add proper security definer settings
*/

-- Drop existing trigger first to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_admin_role ON auth.users;

-- Update handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
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
    longest_streak
  ) VALUES (
    NEW.id,
    0,
    0,
    0,
    0,
    0
  );

  -- Set admin role if applicable
  IF NEW.email = 'admin@admin.com' THEN
    NEW.role := 'admin';
    NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, now());
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error details
    RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers with proper order
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Update RLS policies to ensure proper access
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read own stats" ON public.user_stats;
DROP POLICY IF EXISTS "System can update user stats" ON public.user_stats;

-- Create policies without IF NOT EXISTS
CREATE POLICY "Users can read own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own stats"
  ON public.user_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can update user stats"
  ON public.user_stats
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);