
import { createClient } from '@supabase/supabase-js';

// Check for environment variables and use mock values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-key';

// Log a warning if using mock values
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    "Warning: Using mock Supabase credentials. To use real Supabase integration, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables. " +
    "You can find these in your Supabase project settings under API."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper for cleaning up auth state
export const cleanupAuthState = () => {
  // Clean up any potential auth state
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('sb-refresh-token');
  localStorage.removeItem('sb-provider-token');
  localStorage.removeItem('sb-access-token');
};

export type Profile = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  is_admin: boolean | null;
  default_currency: string | null;
};

export type Portfolio = {
  id: string;
  name: string;
  user_id: string;
  total_value: number;
  cash_balance: number;
  created_at: string;
};

export type GlobalSettings = {
  id: string;
  default_currency: string;
  updated_by: string;
  updated_at: string;
};

export type Holding = {
  id: string;
  portfolio_id: string;
  symbol: string;
  shares: number;
  average_cost: number;
  created_at: string;
};

export type Transaction = {
  id: string;
  portfolio_id: string;
  symbol: string;
  type: 'buy' | 'sell' | 'dividend';
  shares: number;
  price: number;
  total: number;
  date: string;
  created_at: string;
};
