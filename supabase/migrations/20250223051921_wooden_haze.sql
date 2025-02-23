/*
  # Add Most Purchased Products Functionality

  1. New Functions
    - get_most_purchased_products: Returns products ordered by purchase count
    - update_product_purchase_count: Updates purchase count when order is placed

  2. Changes
    - Add purchase_count column to products table
    - Add trigger to update purchase counts on new orders

  3. Security
    - Functions are accessible to authenticated users
*/

-- Add purchase_count column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS purchase_count integer DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_purchase_count
ON products(purchase_count DESC NULLS LAST);

-- Function to get most purchased products
CREATE OR REPLACE FUNCTION get_most_purchased_products(limit_count integer DEFAULT 4)
RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM products
  WHERE purchase_count > 0
  ORDER BY purchase_count DESC, created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update product purchase counts
CREATE OR REPLACE FUNCTION update_product_purchase_counts()
RETURNS trigger AS $$
DECLARE
  item jsonb;
  product_id uuid;
  quantity integer;
BEGIN
  -- Loop through order items and update purchase counts
  FOR item IN SELECT jsonb_array_elements(NEW.items)
  LOOP
    product_id := (item->>'id')::uuid;
    quantity := COALESCE((item->>'quantity')::integer, 1);
    
    -- Update product purchase count
    UPDATE products
    SET 
      purchase_count = COALESCE(purchase_count, 0) + quantity,
      updated_at = now()
    WHERE id = product_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update purchase counts on new orders
DROP TRIGGER IF EXISTS update_product_purchase_counts_trigger ON orders;
CREATE TRIGGER update_product_purchase_counts_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_product_purchase_counts();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_most_purchased_products(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_most_purchased_products(integer) TO service_role;