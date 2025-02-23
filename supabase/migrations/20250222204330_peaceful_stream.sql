-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_recent_purchases(integer);

-- Function to get recent purchases with user info
CREATE OR REPLACE FUNCTION get_recent_purchases(limit_count integer DEFAULT 3)
RETURNS TABLE (
  id uuid,
  user_email text,
  product_name text,
  product_image text,
  original_price numeric,
  savings numeric,
  emotional_trigger text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    CAST(u.email AS text) as user_email,
    CAST((o.items->>0)::jsonb->>'name' AS text) as product_name,
    CAST((o.items->>0)::jsonb->>'image' AS text) as product_image,
    CAST(((o.items->>0)::jsonb->>'price') AS numeric) as original_price,
    CASE 
      WHEN ((o.items->>0)::jsonb->>'is_flash_deal')::boolean THEN
        CAST(((o.items->>0)::jsonb->>'price') AS numeric) * 
        (CAST(((o.items->>0)::jsonb->>'discount_percentage') AS numeric) / 100)
      ELSE 0
    END as savings,
    o.emotional_trigger,
    o.created_at
  FROM orders o
  JOIN auth.users u ON o.user_id = u.id
  ORDER BY o.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_recent_purchases(integer) TO anon;
GRANT EXECUTE ON FUNCTION get_recent_purchases(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_purchases(integer) TO service_role;