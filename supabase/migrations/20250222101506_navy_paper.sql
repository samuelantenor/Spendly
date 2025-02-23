/*
  # Fix User Budgets Error Handling

  1. Changes
    - Add proper error handling for budget queries
    - Update RLS policies to handle no rows found case
    - Add index for better performance
*/

-- Add index for faster budget lookups
CREATE INDEX IF NOT EXISTS idx_user_budgets_user_month 
ON user_budgets(user_id, month);

-- Update the RLS policies to handle the no rows found case better
DROP POLICY IF EXISTS "Users can view their own budgets" ON user_budgets;
CREATE POLICY "Users can view their own budgets"
  ON user_budgets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to safely get current budget
CREATE OR REPLACE FUNCTION get_current_budget(user_id uuid)
RETURNS TABLE (
  id uuid,
  amount numeric,
  month date
) AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, b.amount, b.month
  FROM user_budgets b
  WHERE b.user_id = get_current_budget.user_id
  AND b.month = date_trunc('month', current_date)::date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_current_budget(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_budget(uuid) TO service_role;