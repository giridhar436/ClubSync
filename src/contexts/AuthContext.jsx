import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async (user) => {
      if (!user) {
        setProfile(null);
        return;
      }

      try {
        // Use .maybeSingle() to gracefully handle cases where a profile might not exist yet (0 rows),
        // returning null without an error. It will still error if multiple rows are found,
        // which helps identify data integrity issues.
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          throw error;
        }

        setProfile(data); // data will be the profile object or null
      } catch (error) {
        // This catches both Supabase-specific errors and network errors like 'Failed to fetch'.
        console.error('Error fetching user profile:', error.message);
        setProfile(null);
      }
    };

    setLoading(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setSession(session);
      setUser(currentUser);
      await fetchUserProfile(currentUser);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setSession(session);
        setUser(currentUser);
        // Use setTimeout to defer the async profile fetch, preventing deadlocks
        setTimeout(() => {
          fetchUserProfile(currentUser);
        }, 0);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    return { data, error };
  };

  const signIn = (payload) => supabase.auth.signInWithPassword(payload);

  const signOut = () => supabase.auth.signOut();
  
  const signInWithGoogle = () => {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
  };

  const value = {
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    user,
    profile,
    session,
    loading,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
