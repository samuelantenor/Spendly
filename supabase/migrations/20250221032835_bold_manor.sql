/*
  # Create orders table and related schemas

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `order_number` (text, unique)
      - `status` (text)
      - `total_amount` (numeric)
      - `shipping_address` (jsonb)
      - `items` (jsonb)
      - `created_at` (timestamptz)
    
  2. Security
    - Enable RLS on `orders` table
    - Add policies for users to:
      - Read their own orders
      - Create new orders
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  order_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  total_amount numeric NOT NULL,
  shipping_address jsonb NOT NULL,
  items jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_order_number text;
BEGIN
  new_order_number := 'ORD-' || to_char(NOW(), 'YYYYMMDD') || '-' || 
                      LPAD(CAST(nextval('orders_id_seq') AS text), 4, '0');
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;