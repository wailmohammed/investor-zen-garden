
-- Add portfolio_type column to portfolios table
ALTER TABLE public.portfolios 
ADD COLUMN portfolio_type TEXT NOT NULL DEFAULT 'stock';

-- Add check constraint to ensure valid portfolio types
ALTER TABLE public.portfolios 
ADD CONSTRAINT valid_portfolio_type 
CHECK (portfolio_type IN ('stock', 'crypto'));

-- Update existing portfolios to be stock portfolios by default
UPDATE public.portfolios 
SET portfolio_type = 'stock' 
WHERE portfolio_type IS NULL;
