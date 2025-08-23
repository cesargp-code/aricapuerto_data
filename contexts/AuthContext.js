import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Make sure to use NEXT_PUBLIC_ prefix for client-side environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = (email, password) => {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signOut = () => {
    return supabase.auth.signOut();
  };

  const forgotPassword = (email) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  };

  const updatePassword = (password) => {
    return supabase.auth.updateUser({
      password: password
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        forgotPassword,
        updatePassword,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};