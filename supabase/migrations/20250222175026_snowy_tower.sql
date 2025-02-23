-- Drop the existing process_order function
DROP FUNCTION IF EXISTS process_order(uuid, numeric);
DROP FUNCTION IF EXISTS process_order(uuid, numeric, text);

-- Recreate the function with a single, clear signature
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION process_order(uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION process_order(uuid, numeric, text) TO service_role;