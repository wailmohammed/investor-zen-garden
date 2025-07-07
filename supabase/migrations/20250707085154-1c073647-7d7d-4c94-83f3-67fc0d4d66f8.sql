-- Add scheduled task for dividend detection to run 4 times per day (every 6 hours)
INSERT INTO scheduled_tasks (name, frequency, next_run)
SELECT 
  'dividend-detection-scan',
  'every-6-hours',
  NOW() + INTERVAL '6 hours'
WHERE NOT EXISTS (
  SELECT 1 FROM scheduled_tasks 
  WHERE name = 'dividend-detection-scan'
);