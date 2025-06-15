
-- Create tables for storing API data and sync tracking
CREATE TABLE IF NOT EXISTS public.api_sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id TEXT NOT NULL,
  broker_type TEXT NOT NULL, -- 'trading212', 'binance', etc.
  sync_type TEXT NOT NULL, -- 'manual', 'auto'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed'
  positions_added INTEGER DEFAULT 0,
  positions_updated INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.portfolio_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id TEXT NOT NULL,
  broker_type TEXT NOT NULL,
  symbol TEXT NOT NULL,
  quantity DECIMAL NOT NULL DEFAULT 0,
  average_price DECIMAL NOT NULL DEFAULT 0,
  current_price DECIMAL NOT NULL DEFAULT 0,
  market_value DECIMAL NOT NULL DEFAULT 0,
  unrealized_pnl DECIMAL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, portfolio_id, broker_type, symbol)
);

CREATE TABLE IF NOT EXISTS public.portfolio_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id TEXT NOT NULL,
  broker_type TEXT NOT NULL,
  total_value DECIMAL NOT NULL DEFAULT 0,
  total_return DECIMAL DEFAULT 0,
  total_return_percentage DECIMAL DEFAULT 0,
  today_change DECIMAL DEFAULT 0,
  today_change_percentage DECIMAL DEFAULT 0,
  cash_balance DECIMAL DEFAULT 0,
  holdings_count INTEGER DEFAULT 0,
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, portfolio_id, broker_type)
);

CREATE TABLE IF NOT EXISTS public.auto_sync_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id TEXT NOT NULL,
  broker_type TEXT NOT NULL,
  last_auto_sync TIMESTAMP WITH TIME ZONE,
  sync_count_today INTEGER DEFAULT 0,
  sync_date DATE DEFAULT CURRENT_DATE,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, portfolio_id, broker_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolio_positions_user_portfolio ON public.portfolio_positions(user_id, portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_positions_symbol ON public.portfolio_positions(symbol);
CREATE INDEX IF NOT EXISTS idx_api_sync_logs_user_date ON public.api_sync_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_auto_sync_schedule_next_sync ON public.auto_sync_schedule(user_id, last_auto_sync);

-- Add triggers for updated_at
CREATE TRIGGER update_api_sync_logs_updated_at 
  BEFORE UPDATE ON public.api_sync_logs 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_positions_updated_at 
  BEFORE UPDATE ON public.portfolio_positions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_metadata_updated_at 
  BEFORE UPDATE ON public.portfolio_metadata 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auto_sync_schedule_updated_at 
  BEFORE UPDATE ON public.auto_sync_schedule 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.api_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_sync_schedule ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own sync logs" ON public.api_sync_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync logs" ON public.api_sync_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync logs" ON public.api_sync_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own positions" ON public.portfolio_positions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own positions" ON public.portfolio_positions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own portfolio metadata" ON public.portfolio_metadata
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own portfolio metadata" ON public.portfolio_metadata
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sync schedule" ON public.auto_sync_schedule
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sync schedule" ON public.auto_sync_schedule
  FOR ALL USING (auth.uid() = user_id);
