/*
  # Add Budget Tracking

  1. New Functions
    - get_remaining_budget: Calculates remaining budget for current month
    - update_budget_stats: Updates budget stats when orders are placed

  2. Changes
    - Add remaining_budget to user stats view
    - Add trigger to update budget stats on new orders
*/

-- Function to calculate remaining budget
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
  RETURN COALESCE(current_budget - month_spending, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update budget stats when order is placed
CREATE OR REPLACE FUNCTION update_budget_stats()
RETURNS trigger AS $$
DECLARE
  remaining numeric;
BEGIN
  -- Calculate remaining budget after this order
  remaining := get_remaining_budget(NEW.user_id);
  
  -- Update user stats with new remaining budget
  UPDATE user_stats
  SET 
    total_spent = total_spent + NEW.total_amount,
    updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating budget stats
DROP TRIGGER IF EXISTS update_budget_stats_trigger ON orders;
CREATE TRIGGER update_budget_stats_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_stats();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_remaining_budget(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_remaining_budget(uuid) TO service_role;