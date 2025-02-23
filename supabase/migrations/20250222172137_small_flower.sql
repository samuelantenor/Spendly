/*
  # Flash Deals Expiry Management

  1. Changes
    - Add trigger to automatically handle expired flash deals
    - Add function to check and update expired flash deals
    - Add index to improve performance of flash deal queries

  2. Security
    - Function runs with SECURITY DEFINER to ensure proper permissions
    - Only updates flash deals that have actually expired
*/

-- Create index for flash deals to improve query performance
CREATE INDEX IF NOT EXISTS idx_products_flash_deals
ON products(is_flash_deal, flash_deal_end)
WHERE is_flash_deal = true;

-- Function to update expired flash deals
CREATE OR REPLACE FUNCTION update_expired_flash_deals()
RETURNS trigger AS $$
BEGIN
  -- Check if this is a flash deal and has an end date
  IF NEW.is_flash_deal = true AND NEW.flash_deal_end IS NOT NULL THEN
    -- If the deal has expired, reset the flash deal properties
    IF NEW.flash_deal_end <= CURRENT_TIMESTAMP THEN
      NEW.is_flash_deal := false;
      NEW.flash_deal_end := NULL;
      NEW.discount_percentage := NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to check flash deals on insert or update
DROP TRIGGER IF EXISTS check_flash_deal_expiry ON products;
CREATE TRIGGER check_flash_deal_expiry
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_expired_flash_deals();

-- Function to periodically clean up expired flash deals
CREATE OR REPLACE FUNCTION cleanup_expired_flash_deals()
RETURNS void AS $$
BEGIN
  UPDATE products
  SET 
    is_flash_deal = false,
    flash_deal_end = NULL,
    discount_percentage = NULL
  WHERE 
    is_flash_deal = true 
    AND flash_deal_end <= CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;