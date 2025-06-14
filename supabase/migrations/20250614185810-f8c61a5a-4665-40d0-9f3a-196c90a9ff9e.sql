
-- Fix the infinite recursion issue in profiles table by removing problematic policies
-- and creating a security definer function for admin checks

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read any profile" ON public.profiles;

-- Create a security definer function to check admin status safely
CREATE OR REPLACE FUNCTION public.check_user_is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = user_uuid;
$$;

-- Create new policies using the security definer function
CREATE POLICY "Users can read any profile"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (public.check_user_is_admin(auth.uid()));

-- Ensure your user account has admin privileges
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'wailafmohammed@gmail.com';

-- Also ensure the user subscription is set to Professional for admin
INSERT INTO public.user_subscriptions (user_id, plan, portfolio_limit, watchlist_limit)
SELECT id, 'Professional', 999, 20
FROM public.profiles 
WHERE email = 'wailafmohammed@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  plan = 'Professional',
  portfolio_limit = 999,
  watchlist_limit = 20;
