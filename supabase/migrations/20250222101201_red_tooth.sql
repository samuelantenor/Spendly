/*
  # Add Budget System

  1. New Tables
    - `user_budgets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `amount` (numeric, monthly budget amount)
      - `month` (date, the month this budget is for)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_budgets` table
    - Add policies for authenticated users to manage their own budgets
*/

-- Create user_budgets table
CREATE TABLE user_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  month date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Ensure only one budget per user per month
  UNIQUE(user_id, month)
);

-- Enable RLS
ALTER TABLE user_budgets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own budgets"
  ON user_budgets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budgets"
  ON user_budgets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    -- Ensure the month is the first day of the month
    month = date_trunc('month', month)::date AND
    -- Only allow setting budget for current or future months
    month >= date_trunc('month', current_date)
  );

CREATE POLICY "Users can update their own budgets"
  ON user_budgets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    -- Only allow updating current month's budget if it hasn't been set yet
    (
      month = date_trunc('month', current_date) OR
      month > date_trunc('month', current_date)
    )
  );

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_budget_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating timestamp
CREATE TRIGGER update_budget_timestamp
  BEFORE UPDATE ON user_budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_timestamp();

-- Function to check if user can set budget
CREATE OR REPLACE FUNCTION can_set_budget(user_id uuid, budget_month date)
RETURNS boolean AS $$
BEGIN
  -- Check if a budget already exists for the given month
  IF EXISTS (
    SELECT 1 
    FROM user_budgets 
    WHERE user_budgets.user_id = can_set_budget.user_id 
    AND user_budgets.month = date_trunc('month', budget_month)
  ) THEN
    RETURN FALSE;
  END IF;

  -- Only allow setting budget for current or future months
  RETURN budget_month >= date_trunc('month', current_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;