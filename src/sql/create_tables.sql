
-- Create profiles table with admin flag
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read any profile
CREATE POLICY "Users can read any profile"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policy for admin users to update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create crypto payments table
CREATE TABLE IF NOT EXISTS public.crypto_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  crypto_type TEXT NOT NULL,
  status TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on crypto_payments
ALTER TABLE public.crypto_payments ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own payments
CREATE POLICY "Users can read their own payments"
  ON public.crypto_payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own payments
CREATE POLICY "Users can create their own payments"
  ON public.crypto_payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for admins to read all payments
CREATE POLICY "Admins can read all payments"
  ON public.crypto_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Function to get all users (for admin use)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS SETOF auth.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth
AS $$
BEGIN
  -- Check if the user is an admin
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RETURN QUERY SELECT * FROM auth.users;
  ELSE
    RAISE EXCEPTION 'Access denied: Only admins can view all users';
  END IF;
END;
$$;

-- Function to create first admin user
CREATE OR REPLACE FUNCTION public.create_initial_admin()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if any users exist
  SELECT EXISTS (SELECT 1 FROM auth.users LIMIT 1) INTO user_exists;
  
  -- If users exist but no admin, make the first user an admin
  IF user_exists AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE is_admin = true) THEN
    INSERT INTO public.profiles (id, email, is_admin)
    SELECT id, email, true FROM auth.users
    ORDER BY created_at ASC
    LIMIT 1
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  END IF;
END;
$$;

-- Trigger to automatically create profile after user signup
CREATE OR REPLACE FUNCTION public.create_profile_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
  -- Call create_initial_admin to check if this should be an admin
  PERFORM public.create_initial_admin();
  
  RETURN new;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_profile_on_signup();
