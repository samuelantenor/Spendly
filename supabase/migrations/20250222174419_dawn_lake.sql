-- Add emotional trigger column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS emotional_trigger text;

-- Create index for emotional trigger analysis
CREATE INDEX IF NOT EXISTS idx_orders_emotional_trigger
ON orders(emotional_trigger);

-- Update the order processing function to handle emotional triggers
CREATE OR REPLACE FUNCTION process_order(
  p_user_id uuid,
  p_total_amount numeric,
  p_emotional_trigger text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_remaining_budget numeric;
  v_current_points integer;
BEGIN
  -- Get remaining budget
  SELECT get_remaining_budget(p_user_id) INTO v_remaining_budget;
  
  -- Get current points
  SELECT points INTO v_current_points
  FROM user_stats
  WHERE user_id = p_user_id;

  -- If no budget remaining, deduct points equal to purchase amount
  IF v_remaining_budget <= 0 THEN
    -- Check if user has enough points
    IF v_current_points < FLOOR(p_total_amount) THEN
      RETURN false; -- Not enough points to cover purchase
    END IF;
    
    -- Deduct points
    UPDATE user_stats
    SET 
      points = points - FLOOR(p_total_amount),
      updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to analyze emotional spending patterns
CREATE OR REPLACE FUNCTION get_emotional_spending_patterns(
  p_user_id uuid,
  p_start_date timestamptz DEFAULT (now() - interval '30 days'),
  p_end_date timestamptz DEFAULT now()
)
RETURNS TABLE (
  emotional_trigger text,
  total_amount numeric,
  purchase_count bigint,
  average_amount numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.emotional_trigger,
    SUM(o.total_amount) as total_amount,
    COUNT(*) as purchase_count,
    AVG(o.total_amount) as average_amount
  FROM orders o
  WHERE 
    o.user_id = p_user_id
    AND o.created_at BETWEEN p_start_date AND p_end_date
    AND o.emotional_trigger IS NOT NULL
  GROUP BY o.emotional_trigger
  ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_emotional_spending_patterns(uuid, timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION get_emotional_spending_patterns(uuid, timestamptz, timestamptz) TO service_role;