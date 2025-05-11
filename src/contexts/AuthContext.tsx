
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import {
  usingMockCredentials,
  generateUniqueId,
  checkAdminStatus,
  fetchDefaultCurrency,
  handleSignIn,
  handleSignUp,
  handleSignOut,
  updateUserCurrency
} from '@/utils/authUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  usingMockCredentials: boolean;
  uniqueId: string | null;
  defaultCurrency: string;
  updateDefaultCurrency: (currency: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uniqueId, setUniqueId] = useState<string | null>(null);
  const [defaultCurrency, setDefaultCurrency] = useState<string>('USD');
  const { toast } = useToast();

  useEffect(() => {
    if (usingMockCredentials) {
      // Initialize from localStorage if using mock credentials
      const storedUser = localStorage.getItem('mockUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAdmin(parsedUser.email?.includes('admin') || false);
          setUniqueId(generateUniqueId(parsedUser.id));
          const storedCurrency = localStorage.getItem('mockDefaultCurrency') || 'USD';
          setDefaultCurrency(storedCurrency);
        } catch (error) {
          console.error("Error parsing stored mock user:", error);
        }
      }
      setLoading(false);
      return;
    }

    // First set up auth state listener to prevent missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          // Generate a unique ID based on the user's ID
          setUniqueId(generateUniqueId(session.user.id));
          
          // Defer fetching profile info to prevent potential deadlocks
          setTimeout(() => {
            checkAdminStatus(session.user.id, session.user).then(isAdmin => {
              setIsAdmin(isAdmin);
            });
            
            fetchDefaultCurrency(session.user.id).then(currency => {
              setDefaultCurrency(currency);
            });
          }, 0);
        } else {
          setIsAdmin(false);
          setUniqueId(null);
          setDefaultCurrency('USD');
        }
        
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        setUniqueId(generateUniqueId(session.user.id));
        checkAdminStatus(session.user.id, session.user).then(isAdmin => {
          setIsAdmin(isAdmin);
        });
        fetchDefaultCurrency(session.user.id).then(currency => {
          setDefaultCurrency(currency);
        });
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { user, error } = await handleSignIn(email, password);
      
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in to your account.",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { user, error } = await handleSignUp(email, password);
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: usingMockCredentials 
          ? "You've successfully registered." 
          : "Check your email for the confirmation link.",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await handleSignOut();
      
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You've successfully signed out of your account.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateDefaultCurrency = async (currency: string) => {
    if (!user) return;
    
    try {
      const { error } = await updateUserCurrency(user.id, currency);
      
      if (error) {
        toast({
          title: "Failed to update currency",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setDefaultCurrency(currency);
      toast({
        title: "Currency updated",
        description: `Default currency set to ${currency}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating currency",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    usingMockCredentials,
    uniqueId,
    defaultCurrency,
    updateDefaultCurrency,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
