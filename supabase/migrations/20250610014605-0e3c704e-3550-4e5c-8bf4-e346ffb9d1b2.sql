
-- Create watchlists table
CREATE TABLE public.watchlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

-- Create policies for watchlists
CREATE POLICY "Users can view their own watchlists" 
  ON public.watchlists 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own watchlists" 
  ON public.watchlists 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlists" 
  ON public.watchlists 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlists" 
  ON public.watchlists 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Update user_subscriptions table to include watchlist limits
ALTER TABLE public.user_subscriptions 
ADD COLUMN watchlist_limit INTEGER NOT NULL DEFAULT 1;

-- Update existing subscriptions with watchlist limits
UPDATE public.user_subscriptions 
SET watchlist_limit = CASE 
  WHEN plan = 'Professional' THEN 20
  WHEN plan = 'Premium' THEN 10
  ELSE 1
END;

-- Update the trigger function to include watchlist limits
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan, portfolio_limit, watchlist_limit)
  VALUES (
    NEW.id,
    CASE WHEN NEW.is_admin = true THEN 'Professional' ELSE 'Free' END,
    CASE WHEN NEW.is_admin = true THEN 999 ELSE 1 END,
    CASE WHEN NEW.is_admin = true THEN 20 ELSE 1 END
  );
  RETURN NEW;
END;
$$;
