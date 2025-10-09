-- Create admin_wallets table for managing cryptocurrency payment wallets
CREATE TABLE public.admin_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  currency TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_wallets ENABLE ROW LEVEL SECURITY;

-- Only admins can manage wallets
CREATE POLICY "Only admins can manage admin wallets"
ON public.admin_wallets
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_admin_wallets_updated_at
BEFORE UPDATE ON public.admin_wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();