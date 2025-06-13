
-- Create dividends table to track dividend payments
CREATE TABLE public.dividends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  company_name TEXT,
  dividend_amount DECIMAL(15,4) NOT NULL,
  payment_date DATE NOT NULL,
  ex_dividend_date DATE,
  record_date DATE,
  currency TEXT NOT NULL DEFAULT 'USD',
  dividend_type TEXT NOT NULL DEFAULT 'regular', -- regular, special, interim, final
  shares_owned DECIMAL(15,4),
  total_received DECIMAL(15,4) NOT NULL,
  tax_withheld DECIMAL(15,4) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dividend_settings table for user preferences
CREATE TABLE public.dividend_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  default_portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE SET NULL,
  auto_import_enabled BOOLEAN DEFAULT false,
  notification_enabled BOOLEAN DEFAULT true,
  preferred_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add RLS policies for dividends
ALTER TABLE public.dividends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dividends" 
  ON public.dividends 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dividends" 
  ON public.dividends 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dividends" 
  ON public.dividends 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dividends" 
  ON public.dividends 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for dividend_settings
ALTER TABLE public.dividend_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dividend settings" 
  ON public.dividend_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dividend settings" 
  ON public.dividend_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dividend settings" 
  ON public.dividend_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_dividends_user_id ON public.dividends(user_id);
CREATE INDEX idx_dividends_portfolio_id ON public.dividends(portfolio_id);
CREATE INDEX idx_dividends_symbol ON public.dividends(symbol);
CREATE INDEX idx_dividends_payment_date ON public.dividends(payment_date);
CREATE INDEX idx_dividend_settings_user_id ON public.dividend_settings(user_id);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_dividends_updated_at 
  BEFORE UPDATE ON public.dividends 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dividend_settings_updated_at 
  BEFORE UPDATE ON public.dividend_settings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
