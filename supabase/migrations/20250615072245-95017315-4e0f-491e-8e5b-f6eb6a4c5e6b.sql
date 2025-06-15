
-- Create the detected_dividends table that's missing
CREATE TABLE IF NOT EXISTS public.detected_dividends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  portfolio_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  company_name TEXT,
  annual_dividend NUMERIC DEFAULT 0,
  dividend_yield NUMERIC DEFAULT 0,
  frequency TEXT DEFAULT 'quarterly',
  ex_dividend_date DATE,
  payment_date DATE,
  shares_owned NUMERIC,
  estimated_annual_income NUMERIC DEFAULT 0,
  detection_source TEXT DEFAULT 'api',
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, portfolio_id, symbol)
);

-- Enable RLS
ALTER TABLE public.detected_dividends ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for detected_dividends
CREATE POLICY "Users can view their own detected dividends" 
  ON public.detected_dividends 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own detected dividends" 
  ON public.detected_dividends 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own detected dividends" 
  ON public.detected_dividends 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own detected dividends" 
  ON public.detected_dividends 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create dividend detection jobs table
CREATE TABLE IF NOT EXISTS public.dividend_detection_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  portfolio_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  stocks_analyzed INTEGER DEFAULT 0,
  dividend_stocks_found INTEGER DEFAULT 0,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for dividend detection jobs
ALTER TABLE public.dividend_detection_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dividend_detection_jobs
CREATE POLICY "Users can view their own dividend detection jobs" 
  ON public.dividend_detection_jobs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own dividend detection jobs" 
  ON public.dividend_detection_jobs 
  FOR ALL 
  USING (auth.uid() = user_id);
