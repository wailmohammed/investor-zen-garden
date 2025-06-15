
-- Fix the infinite recursion issue in profiles table RLS policies
-- Drop the existing problematic policies
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Create a simpler, more direct policy for profile updates
-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update any profile (using a direct check to avoid recursion)
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Also fix the check_user_is_admin function to avoid the recursion
-- by making it more specific and using a direct query without triggering RLS
CREATE OR REPLACE FUNCTION public.check_user_is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = user_uuid LIMIT 1;
$$;
