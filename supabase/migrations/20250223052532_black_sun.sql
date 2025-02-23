-- Create fake users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES
  (gen_random_uuid(), 'sarah.smith@example.com', crypt('password123', gen_salt('bf')), now()),
  (gen_random_uuid(), 'john.doe@example.com', crypt('password123', gen_salt('bf')), now()),
  (gen_random_uuid(), 'emma.wilson@example.com', crypt('password123', gen_salt('bf')), now()),
  (gen_random_uuid(), 'michael.brown@example.com', crypt('password123', gen_salt('bf')), now()),
  (gen_random_uuid(), 'olivia.jones@example.com', crypt('password123', gen_salt('bf')), now());

-- Create fake orders with emotional triggers
WITH user_ids AS (
  SELECT id FROM auth.users WHERE email LIKE '%@example.com'
),
product_data AS (
  SELECT id, price FROM products LIMIT 10
),
order_data AS (
  SELECT 
    u.id as user_id,
    p.id as product_id,
    p.price,
    (ARRAY['stress', 'boredom', 'celebration', 'social', 'sadness', 'impulse', 'fomo', 'planned'])[floor(random() * 8 + 1)] as emotional_trigger,
    floor(random() * 3 + 1)::int as quantity,
    (now() - (floor(random() * 30)::int || ' days')::interval) as order_date
  FROM user_ids u
  CROSS JOIN product_data p,
  generate_series(1, 5) -- 5 orders per user
)
INSERT INTO orders (
  user_id,
  order_number,
  status,
  total_amount,
  emotional_trigger,
  shipping_address,
  items,
  created_at
)
SELECT 
  user_id,
  'ORD-' || to_char(order_date, 'YYYYMMDD') || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY order_date), 4, '0'),
  'completed',
  price * quantity,
  emotional_trigger,
  jsonb_build_object(
    'fullName', 'Test User',
    'address', '123 Test St',
    'city', 'Test City',
    'state', 'TS',
    'zipCode', '12345'
  ),
  jsonb_build_array(
    jsonb_build_object(
      'id', product_id,
      'price', price,
      'quantity', quantity
    )
  ),
  order_date
FROM order_data;

-- Update user stats for fake users
INSERT INTO user_stats (
  user_id,
  points,
  total_spent,
  current_streak,
  longest_streak,
  last_purchase_date
)
SELECT 
  u.id,
  floor(random() * 1000 + 100), -- Random points between 100 and 1100
  (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE user_id = u.id),
  floor(random() * 7), -- Random streak between 0 and 7
  floor(random() * 14), -- Random longest streak between 0 and 14
  (SELECT MAX(created_at)::date FROM orders WHERE user_id = u.id)
FROM auth.users u
WHERE email LIKE '%@example.com'
ON CONFLICT (user_id) DO UPDATE
SET
  points = EXCLUDED.points,
  total_spent = EXCLUDED.total_spent,
  current_streak = EXCLUDED.current_streak,
  longest_streak = EXCLUDED.longest_streak,
  last_purchase_date = EXCLUDED.last_purchase_date;

-- Update leaderboard entries for fake users
INSERT INTO leaderboard_entries (
  user_id,
  points,
  rank
)
SELECT 
  user_id,
  points,
  ROW_NUMBER() OVER (ORDER BY points DESC)
FROM user_stats
WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@example.com')
ON CONFLICT (user_id) DO UPDATE
SET
  points = EXCLUDED.points,
  rank = EXCLUDED.rank,
  updated_at = now();

-- Award some achievements to fake users
INSERT INTO user_achievements (
  user_id,
  achievement_id,
  earned_at
)
SELECT 
  u.id,
  a.id,
  now() - (floor(random() * 30)::int || ' days')::interval
FROM auth.users u
CROSS JOIN achievements a
WHERE u.email LIKE '%@example.com'
AND random() < 0.7 -- 70% chance to get each achievement
ON CONFLICT DO NOTHING;