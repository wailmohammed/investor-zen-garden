
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  defaultCurrency: string;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (error) {
          console.error('Error getting session:', error);
          // Don't create mock session, just set to null
          setSession(null);
          setUser(null);
        } else {
          console.log("Session found:", session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Fetch profile data
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin, default_currency')
                .eq('id', session.user.id)
                .single();
              
              if (isMounted) {
                setIsAdmin(profile?.is_admin || false);
                setDefaultCurrency(profile?.default_currency || 'USD');
              }
            } catch (profileError) {
              console.error('Error fetching profile:', profileError);
              if (isMounted) {
                setIsAdmin(false);
                setDefaultCurrency('USD');
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setDefaultCurrency('USD');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log("Auth initialization complete");
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_admin, default_currency')
              .eq('id', session.user.id)
              .single();
            
            if (isMounted) {
              setIsAdmin(profile?.is_admin || false);
              setDefaultCurrency(profile?.default_currency || 'USD');
            }
          } catch (error) {
            console.error('Error fetching profile on auth change:', error);
            if (isMounted) {
              setIsAdmin(false);
              setDefaultCurrency('USD');
            }
          }
        } else {
          if (isMounted) {
            setIsAdmin(false);
            setDefaultCurrency('USD');
          }
        }
        
        if (isMounted) {
          setIsLoading(false);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
      
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        });
      }
      
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password reset email sent",
          description: "Check your email for the password reset link.",
        });
      }
      
      return { error };
    } catch (error) {
      console.error('Password reset error:', error);
      return { error: error as AuthError };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    defaultCurrency,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
