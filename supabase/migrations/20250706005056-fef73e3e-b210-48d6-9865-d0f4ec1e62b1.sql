-- Insert portfolio metadata for existing portfolio data
INSERT INTO portfolio_metadata (
  user_id, 
  portfolio_id, 
  broker_type, 
  total_value, 
  total_return, 
  total_return_percentage, 
  today_change, 
  today_change_percentage, 
  holdings_count,
  last_sync_at
)
SELECT 
  'bea0cf67-91f8-4871-ac62-de5eb6f1e06f' as user_id,
  '74d4807b-3e65-402a-a48a-cda368e6bea6' as portfolio_id,
  'trading212' as broker_type,
  3347.31 as total_value,
  -56.29 as total_return,
  -1.68 as total_return_percentage,
  0 as today_change,
  0 as today_change_percentage,
  264 as holdings_count,
  NOW() as last_sync_at
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_metadata 
  WHERE user_id = 'bea0cf67-91f8-4871-ac62-de5eb6f1e06f' 
  AND portfolio_id = '74d4807b-3e65-402a-a48a-cda368e6bea6'
);