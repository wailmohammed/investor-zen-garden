
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, cleanupAuthState } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  usingMockCredentials: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if we're using mock Supabase credentials
const usingMockCredentials = 
  !import.meta.env.VITE_SUPABASE_URL || 
  !import.meta.env.VITE_SUPABASE_ANON_KEY;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // First set up auth state listener to prevent missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          // Defer fetching profile info to prevent potential deadlocks
          setTimeout(() => {
            checkAdminStatus(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error checking admin status:", error.message);
        return;
      }
      
      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up existing auth state before signing in
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        // Continue even if this fails
      }
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
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
      // Clean up existing auth state before signing up
      cleanupAuthState();
      
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Check your email for the confirmation link.",
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
      // Clean up auth state first
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      
      // Force page reload for a clean state
      window.location.href = '/login';
      
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

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    usingMockCredentials: false, // We're now using real Supabase credentials
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
