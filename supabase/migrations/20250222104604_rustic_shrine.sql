-- Function to check budget and process order
CREATE OR REPLACE FUNCTION process_order(
  p_user_id uuid,
  p_total_amount numeric
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

-- Update the order processing trigger to check budget
CREATE OR REPLACE FUNCTION check_budget_before_order()
RETURNS trigger AS $$
BEGIN
  -- Check budget and process order
  IF NOT process_order(NEW.user_id, NEW.total_amount) THEN
    RAISE EXCEPTION 'Insufficient budget and points for this purchase';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to check budget before order
CREATE TRIGGER check_budget_before_order_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION check_budget_before_order();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION process_order(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION process_order(uuid, numeric) TO service_role;