import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./integrations/supabase/client";

interface User {
  id: string;
  email: string;
  onboardingComplete?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sendMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email || "",
              onboardingComplete: session.user.user_metadata?.onboarding_complete,
            }
          : null,
      );
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email || "",
              onboardingComplete: session.user.user_metadata?.onboarding_complete,
            }
          : null,
      );
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sendMagicLink = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Change this from /dashboard to root, let App.tsx handle routing
          emailRedirectTo: `${window.location.origin}/`,
          // OR specifically to onboarding:
          // emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Send magic link error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        sendMagicLink,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
