/*
  # Add admin features

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `image` (text)
      - `category` (text)
      - `is_flash_deal` (boolean)
      - `flash_deal_end` (timestamptz)
      - `discount_percentage` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for admin access
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  image text NOT NULL,
  category text NOT NULL,
  is_flash_deal boolean DEFAULT false,
  flash_deal_end timestamptz,
  discount_percentage integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create admin role and grant necessary permissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin'
  ) THEN
    CREATE ROLE admin;
  END IF;
END
$$;

-- Policies for products
CREATE POLICY "Enable read access for all users" ON products
  FOR SELECT USING (true);

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

-- Policies for categories
CREATE POLICY "Enable read access for all users" ON categories
  FOR SELECT USING (true);

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

-- Function to update product timestamps
CREATE OR REPLACE FUNCTION update_product_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating product timestamps
CREATE TRIGGER update_product_timestamp
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_timestamp();