/*
  # Move products to database and enhance admin functionality

  1. Changes
    - Insert initial products from TypeScript into database
    - Add indexes for better query performance
    - Add trigger for updating timestamps

  2. Security
    - Maintain existing RLS policies
*/

-- Insert initial products
INSERT INTO products (name, description, price, image, category)
VALUES
  ('Premium Wireless Headphones', 'High-quality wireless headphones with noise cancellation and premium sound quality.', 299.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 'Electronics'),
  ('Smart Fitness Watch', 'Track your fitness goals with this advanced smartwatch featuring heart rate monitoring.', 199.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 'Electronics'),
  ('Leather Weekend Bag', 'Handcrafted genuine leather weekend bag, perfect for short trips.', 159.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 'Fashion'),
  ('Minimalist Desk Lamp', 'Modern LED desk lamp with adjustable brightness and color temperature.', 89.99, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80', 'Home'),
  ('Organic Cotton T-Shirt', 'Sustainable, soft organic cotton t-shirt in classic design.', 34.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'Fashion'),
  ('Ceramic Pour-Over Coffee Set', 'Handcrafted ceramic coffee dripper with matching cup and stand.', 79.99, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', 'Home'),
  ('Wireless Gaming Mouse', 'Professional gaming mouse with customizable RGB lighting and macro buttons.', 129.99, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80', 'Electronics'),
  ('Bamboo Bath Towel Set', 'Luxury bamboo fiber towel set, includes bath towel, hand towel, and washcloth.', 69.99, 'https://images.unsplash.com/photo-1600369672770-985fd30004eb?w=800&q=80', 'Home');

-- Insert initial categories
INSERT INTO categories (name)
SELECT DISTINCT category 
FROM products 
ON CONFLICT (name) DO NOTHING;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_flash_deal ON products(is_flash_deal) WHERE is_flash_deal = true;
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at DESC);

-- Add function to check flash deal expiry
CREATE OR REPLACE FUNCTION check_flash_deal_expiry()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_flash_deal AND NEW.flash_deal_end < now() THEN
    NEW.is_flash_deal := false;
    NEW.flash_deal_end := NULL;
    NEW.discount_percentage := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for checking flash deal expiry
CREATE TRIGGER check_flash_deal_expiry_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION check_flash_deal_expiry();