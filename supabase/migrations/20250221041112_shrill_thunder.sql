/*
  # Add admin role configuration

  1. Changes
    - Add admin role to auth.users
    - Create policy for admin role assignment
    - Add trigger to handle admin role assignment
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
CREATE OR REPLACE FUNCTION handle_admin_user()
RETURNS trigger AS $$
BEGIN
  IF NEW.email = 'admin@admin.com' THEN
    NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set admin role
DROP TRIGGER IF EXISTS set_admin_role ON auth.users;
CREATE TRIGGER set_admin_role
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_admin_user();

-- Update existing admin user if exists
UPDATE auth.users
SET role = 'admin'
WHERE email = 'admin@admin.com';

-- Grant necessary permissions to admin role
GRANT USAGE ON SCHEMA public TO admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO admin;