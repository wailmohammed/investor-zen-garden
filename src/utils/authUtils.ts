import { User } from '@supabase/supabase-js';
import { supabase, cleanupAuthState } from '@/integrations/supabase/client';

// Check if we're using mock Supabase credentials
export const usingMockCredentials = 
  !import.meta.env.VITE_SUPABASE_URL || 
  !import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock storage for demo purposes when not connected to Supabase
export const mockUserStorage: { [key: string]: any } = {};

// Generate a unique user ID based on the user's UUID
export const generateUniqueId = (userId: string): string => {
  // Generate a shorter, readable unique ID based on the user's UUID
  // Take first 8 chars and add timestamp for uniqueness
  const shortId = userId.substring(0, 8);
  const timestamp = Date.now().toString(36).substring(4);
  return `UID-${shortId}-${timestamp}`.toUpperCase();
};

// Check if the user is an admin
export const checkAdminStatus = async (userId: string, user: User | null) => {
  try {
    if (usingMockCredentials) {
      // In mock mode, any email containing 'admin' is considered an admin
      const isAdmin = user?.email?.includes('admin') || false;
      console.log("Mock admin check for", user?.email, "result:", isAdmin);
      return isAdmin;
    }

    // Query the profiles table to check if the user is an admin
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error checking admin status:", error.message);
      
      // Fallback: Check if the email contains 'admin'
      const isEmailAdmin = user?.email?.includes('admin') || false;
      console.log("Fallback admin check for", user?.email, "result:", isEmailAdmin);
      return isEmailAdmin;
    }
    
    console.log("Database admin status for", user?.email, "result:", data?.is_admin || false);
    // Return admin status based on the value from the database
    return data?.is_admin || false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    
    // Fallback in case of error
    const isEmailAdmin = user?.email?.includes('admin') || false;
    console.log("Error fallback admin check for", user?.email, "result:", isEmailAdmin);
    return isEmailAdmin;
  }
};

// Fetch the user's default currency
export const fetchDefaultCurrency = async (userId: string) => {
  try {
    if (usingMockCredentials) {
      const storedCurrency = localStorage.getItem('mockDefaultCurrency') || 'USD';
      return storedCurrency;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('default_currency')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching default currency:", error.message);
      return 'USD';
    }
    
    return data?.default_currency || 'USD';
  } catch (error) {
    console.error("Error fetching default currency:", error);
    return 'USD';
  }
};

// Handle sign in with mock or Supabase
export const handleSignIn = async (email: string, password: string) => {
  if (usingMockCredentials) {
    // Mock authentication
    const mockUser = {
      id: `mock-${Date.now().toString(36)}`,
      email,
      user_metadata: { name: email.split('@')[0] },
      app_metadata: {},
      aud: "mock",
      created_at: new Date().toISOString(),
    };

    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    return { user: mockUser, error: null };
  }
  
  // Clean up existing auth state before signing in
  cleanupAuthState();
  
  // Attempt global sign out first
  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (error) {
    // Continue even if this fails
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data.user, error };
};

// Handle sign up with mock or Supabase
export const handleSignUp = async (email: string, password: string) => {
  if (usingMockCredentials) {
    // Mock registration
    const mockUser = {
      id: `mock-${Date.now().toString(36)}`,
      email,
      user_metadata: { name: email.split('@')[0] },
      app_metadata: {},
      aud: "mock",
      created_at: new Date().toISOString(),
    };

    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    return { user: mockUser, error: null };
  }
  
  // Clean up existing auth state before signing up
  cleanupAuthState();
  
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { user: data.user, error };
};

// Handle sign out with mock or Supabase
export const handleSignOut = async () => {
  if (usingMockCredentials) {
    // Clear mock user
    localStorage.removeItem('mockUser');
    localStorage.removeItem('mockDefaultCurrency');
    
    // Force page reload for a clean state
    window.location.href = '/login';
    return { error: null };
  }
  
  // Clean up auth state first
  cleanupAuthState();
  
  const { error } = await supabase.auth.signOut({ scope: 'global' });
  
  // Force page reload for a clean state
  if (!error) {
    window.location.href = '/login';
  }
  
  return { error };
};

// Update the user's default currency
export const updateUserCurrency = async (userId: string, currency: string) => {
  if (usingMockCredentials) {
    localStorage.setItem('mockDefaultCurrency', currency);
    return { error: null };
  }
  
  const { error } = await supabase
    .from('profiles')
    .update({ default_currency: currency })
    .eq('id', userId);
  
  return { error };
};
