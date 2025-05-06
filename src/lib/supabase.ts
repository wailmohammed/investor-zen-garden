
import { createClient } from '@supabase/supabase-js';

// Check for environment variables and throw a more descriptive error if they're missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Supabase URL is missing. Please set the VITE_SUPABASE_URL environment variable in your .env file. " + 
    "You can find this in your Supabase project settings under API."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Supabase Anon Key is missing. Please set the VITE_SUPABASE_ANON_KEY environment variable in your .env file. " +
    "You can find this in your Supabase project settings under API."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  created_at: string;
};

export type Portfolio = {
  id: string;
  name: string;
  user_id: string;
  total_value: number;
  cash_balance: number;
  created_at: string;
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
