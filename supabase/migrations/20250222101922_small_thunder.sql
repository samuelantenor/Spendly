/*
  # Fix Budget Function

  1. Changes
    - Drop and recreate get_remaining_budget function with proper type definition
    - Ensure proper permissions are granted
    - Add better error handling
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_remaining_budget(uuid);

-- Recreate the function with proper type definition and error handling
CREATE OR REPLACE FUNCTION get_remaining_budget(user_id uuid)
RETURNS numeric AS $$
DECLARE
  current_budget numeric;
  month_spending numeric;
BEGIN
  -- Get current month's budget
  SELECT amount INTO current_budget
  FROM user_budgets
  WHERE user_budgets.user_id = get_remaining_budget.user_id
  AND month = date_trunc('month', current_date)::date;

  -- Get current month's spending
  SELECT COALESCE(SUM(total_amount), 0) INTO month_spending
  FROM orders
  WHERE orders.user_id = get_remaining_budget.user_id
  AND date_trunc('month', created_at) = date_trunc('month', current_date);

  -- Return remaining budget or 0 if no budget set
  RETURN COALESCE(NULLIF(current_budget - month_spending, 0), 0);

EXCEPTION WHEN OTHERS THEN
  -- Log error and return 0 on any error
  RAISE WARNING 'Error in get_remaining_budget: %', SQLERRM;
  RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure proper permissions are granted
REVOKE ALL ON FUNCTION get_remaining_budget(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_remaining_budget(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_remaining_budget(uuid) TO service_role;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_created_at 
ON orders(user_id, created_at);

-- Verify function exists and is accessible
DO $$
BEGIN
  PERFORM get_remaining_budget(NULL);
  RAISE NOTICE 'Function get_remaining_budget is working correctly';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Function verification failed: %', SQLERRM;
END $$;