import { createClient } from '@supabase/supabase-js';

// Use the actual Supabase project credentials
const supabaseUrl = 'https://tngtalojrxengqqrkcwl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ3RhbG9qcnhlbmdxcXJrY3dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MDY5NDIsImV4cCI6MjA2MjE4Mjk0Mn0.diBCjpGx-zU5Sj-gQP0AmZUeqPBxkLXTOIR_ecesqks';

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
