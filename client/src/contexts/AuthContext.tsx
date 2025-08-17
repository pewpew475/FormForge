import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithOAuth: (provider: 'google' | 'azure') => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  changeEmail: (newEmail: string, password: string) => Promise<void>;
  updateProfile: (updates: { full_name?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN') {
        toast({
          title: "Welcome!",
          description: "You have been successfully signed in.",
        });
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signInWithOAuth = async (provider: 'google' | 'azure') => {
    try {
      // Check if we're on a form page and preserve the URL
      const currentPath = window.location.pathname;
      const isFormPage = currentPath.startsWith('/form/');
      const redirectTo = isFormPage
        ? `${window.location.origin}${currentPath}`
        : `${window.location.origin}/`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "Authentication Error",
        description: authError.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "Sign In Error",
        description: authError.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your registration.",
      });
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "Sign Up Error",
        description: authError.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "Sign Out Error",
        description: authError.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!user?.email) {
        throw new Error('No user email found');
      }

      // First verify the current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        throw new Error('Current password is incorrect');
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "Password Change Failed",
        description: authError.message || "Failed to change password",
        variant: "destructive",
      });
      throw error;
    }
  };

  const changeEmail = async (newEmail: string, password: string) => {
    try {
      if (!user?.email) {
        throw new Error('No user email found');
      }

      // First verify the password
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (verifyError) {
        throw new Error('Password is incorrect');
      }

      // Update the email
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;

      toast({
        title: "Email Update Initiated",
        description: "Please check both your old and new email addresses for confirmation links.",
      });
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "Email Change Failed",
        description: authError.message || "Failed to change email",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfile = async (updates: { full_name?: string }) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "Profile Update Failed",
        description: authError.message || "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithOAuth,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    changePassword,
    changeEmail,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
