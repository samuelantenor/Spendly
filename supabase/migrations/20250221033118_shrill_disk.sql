/*
  # Create sequence and fix order number generation

  1. Changes
    - Add sequence for order numbers
    - Update order number generation function
    - Add trigger to automatically set order number on insert
*/

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq;

-- Update the order number generation function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_order_number text;
BEGIN
  new_order_number := 'ORD-' || to_char(NOW(), 'YYYYMMDD') || '-' || 
                      LPAD(CAST(nextval('order_number_seq') AS text), 4, '0');
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS trigger AS $$
BEGIN
  NEW.order_number := generate_order_number();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();