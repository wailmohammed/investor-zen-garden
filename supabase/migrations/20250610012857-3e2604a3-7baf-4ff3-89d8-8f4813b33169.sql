
-- Create portfolios table
CREATE TABLE public.portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Create policies for portfolios
CREATE POLICY "Users can view their own portfolios" 
  ON public.portfolios 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolios" 
  ON public.portfolios 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios" 
  ON public.portfolios 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios" 
  ON public.portfolios 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create user subscriptions table to track plan limits
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'Free',
  portfolio_limit INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for user subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription" 
  ON public.user_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
  ON public.user_subscriptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Insert default subscription for existing users and set admin to Professional
INSERT INTO public.user_subscriptions (user_id, plan, portfolio_limit)
SELECT id, 
       CASE WHEN is_admin = true THEN 'Professional' ELSE 'Free' END,
       CASE WHEN is_admin = true THEN 999 ELSE 1 END
FROM public.profiles
ON CONFLICT (user_id) DO UPDATE SET
  plan = CASE WHEN EXCLUDED.plan = 'Professional' THEN 'Professional' ELSE user_subscriptions.plan END,
  portfolio_limit = CASE WHEN EXCLUDED.portfolio_limit = 999 THEN 999 ELSE user_subscriptions.portfolio_limit END;

-- Create function to automatically create subscription for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan, portfolio_limit)
  VALUES (
    NEW.id,
    CASE WHEN NEW.is_admin = true THEN 'Professional' ELSE 'Free' END,
    CASE WHEN NEW.is_admin = true THEN 999 ELSE 1 END
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create subscription when profile is created
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_subscription();
