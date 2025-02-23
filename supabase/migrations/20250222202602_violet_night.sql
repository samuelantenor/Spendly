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
    u.email as user_email,
    (o.items->>0)::jsonb->>'name' as product_name,
    (o.items->>0)::jsonb->>'image' as product_image,
    ((o.items->>0)::jsonb->>'price')::numeric as original_price,
    CASE 
      WHEN ((o.items->>0)::jsonb->>'is_flash_deal')::boolean THEN
        ((o.items->>0)::jsonb->>'price')::numeric * 
        (((o.items->>0)::jsonb->>'discount_percentage')::numeric / 100)
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