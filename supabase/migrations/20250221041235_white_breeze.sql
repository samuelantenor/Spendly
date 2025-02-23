/*
  # Fix admin role configuration

  1. Changes
    - Add role column to auth.users if not exists
    - Create function to handle admin role assignment
    - Create trigger for admin role assignment
    - Update RLS policies to use email-based admin checks
*/

-- Add role column to auth schema if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'auth' 
    AND table_name = 'users' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE auth.users ADD COLUMN role text;
  END IF;
END $$;

-- Function to set admin role for specific email
CREATE OR REPLACE FUNCTION public.handle_admin_user()
RETURNS trigger AS $$
BEGIN
  IF NEW.email = 'admin@admin.com' THEN
    NEW.role := 'admin';
    NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set admin role
DROP TRIGGER IF EXISTS set_admin_role ON auth.users;
CREATE TRIGGER set_admin_role
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_user();

-- Update RLS policies for products
DROP POLICY IF EXISTS "Enable insert for admin users" ON products;
DROP POLICY IF EXISTS "Enable update for admin users" ON products;
DROP POLICY IF EXISTS "Enable delete for admin users" ON products;

CREATE POLICY "Enable insert for admin users" ON products
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@admin.com');

CREATE POLICY "Enable update for admin users" ON products
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'admin@admin.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@admin.com');

CREATE POLICY "Enable delete for admin users" ON products
  FOR DELETE
  USING (auth.jwt() ->> 'email' = 'admin@admin.com');

-- Update RLS policies for categories
DROP POLICY IF EXISTS "Enable insert for admin users" ON categories;
DROP POLICY IF EXISTS "Enable update for admin users" ON categories;
DROP POLICY IF EXISTS "Enable delete for admin users" ON categories;

CREATE POLICY "Enable insert for admin users" ON categories
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@admin.com');

CREATE POLICY "Enable update for admin users" ON categories
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'admin@admin.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@admin.com');

CREATE POLICY "Enable delete for admin users" ON categories
  FOR DELETE
  USING (auth.jwt() ->> 'email' = 'admin@admin.com');