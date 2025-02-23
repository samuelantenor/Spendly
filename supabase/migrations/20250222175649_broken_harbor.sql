/*
  # Add Wishlist System

  1. New Tables
    - `wishlists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `is_public` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `wishlist_items`
      - `id` (uuid, primary key)
      - `wishlist_id` (uuid, references wishlists)
      - `product_id` (uuid, references products)
      - `added_at` (timestamptz)
      - `price_at_add` (numeric)
      - `notify_on_sale` (boolean)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create wishlists table
CREATE TABLE wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wishlist_items table
CREATE TABLE wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  price_at_add numeric NOT NULL,
  notify_on_sale boolean DEFAULT true,
  UNIQUE(wishlist_id, product_id)
);

-- Enable RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Policies for wishlists
CREATE POLICY "Users can create their own wishlists"
  ON wishlists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own wishlists"
  ON wishlists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can update their own wishlists"
  ON wishlists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlists"
  ON wishlists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for wishlist_items
CREATE POLICY "Users can add items to their wishlists"
  ON wishlist_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view items in their wishlists"
  ON wishlist_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_id
      AND (user_id = auth.uid() OR is_public = true)
    )
  );

CREATE POLICY "Users can update items in their wishlists"
  ON wishlist_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their wishlists"
  ON wishlist_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_id
      AND user_id = auth.uid()
    )
  );

-- Function to update wishlist timestamp
CREATE OR REPLACE FUNCTION update_wishlist_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating wishlist timestamp
CREATE TRIGGER update_wishlist_timestamp
  BEFORE UPDATE ON wishlists
  FOR EACH ROW
  EXECUTE FUNCTION update_wishlist_timestamp();

-- Function to check for flash deals on wishlist items
CREATE OR REPLACE FUNCTION notify_wishlist_flash_deals()
RETURNS trigger AS $$
BEGIN
  -- If a product goes on flash sale, notify users who have it in their wishlist
  IF NEW.is_flash_deal = true AND (OLD.is_flash_deal = false OR OLD.is_flash_deal IS NULL) THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data
    )
    SELECT DISTINCT
      w.user_id,
      'flash_deal',
      'Flash Deal Alert! 🎉',
      NEW.name || ' is now on sale! ' || NEW.discount_percentage || '% off',
      jsonb_build_object(
        'product_id', NEW.id,
        'product_name', NEW.name,
        'discount', NEW.discount_percentage,
        'original_price', NEW.price,
        'sale_price', NEW.price * (1 - NEW.discount_percentage / 100)
      )
    FROM wishlist_items wi
    JOIN wishlists w ON w.id = wi.wishlist_id
    WHERE wi.product_id = NEW.id
    AND wi.notify_on_sale = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for flash deal notifications
CREATE TRIGGER notify_wishlist_flash_deals_trigger
  AFTER UPDATE OF is_flash_deal ON products
  FOR EACH ROW
  EXECUTE FUNCTION notify_wishlist_flash_deals();