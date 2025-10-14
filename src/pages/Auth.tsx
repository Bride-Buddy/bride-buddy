import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/bride-buddy-logo-ring.png";
import { getCurrentModeConfig, showTestModeIndicator } from "@/config/testMode";
const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // --- Listen for auth state changes ---
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const config = getCurrentModeConfig();

        // Mode 1, 2, 3: All go through AuthRedirect
        navigate("/auth-redirect");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // --- Handle Magic Link Sign-In / Sign-Up ---
  const handleMagicLink = async () => {
  if (!email.trim()) {
    toast.error("Please enter your email");
    return;
  }

  const config = getCurrentModeConfig();
  console.log("🔍 Current config:", config);
  console.log("🔍 skipEmailVerification:", config.skipEmailVerification);

  // Test Mode 1: Skip email verification completely
  if (config.skipEmailVerification) {
    console.log("✅ Mode 1 detected - skipping email verification");
    setLoading(true);

    try {
      // Try to sign in first
      console.log("🔐 Attempting sign in with:", email);
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: "testmode123",
      });

      if (signInError) {
        console.log("⚠️ Sign in failed, attempting sign up:", signInError.message);
        
        // If user doesn't exist, sign them up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: "testmode123",
          options: {
            data: name ? { full_name: name } : undefined,
            emailRedirectTo: `${window.location.origin}/auth-redirect`,
          },
        });

        if (signUpError) {
          console.error("❌ Sign up error:", signUpError);
          toast.error(signUpError.message);
          setLoading(false);
          return;
        }

        console.log("✅ Sign up successful:", signUpData);
        toast.success("Account created! Redirecting...");
      } else {
        console.log("✅ Sign in successful:", signInData);
        toast.success("Signed in! Redirecting...");
      }

      setLoading(false);
      // Auth state change will handle redirect
      return;
    } catch (error: any) {
      console.error("❌ Unexpected error:", error);
      toast.error(error.message || "Authentication failed");
      setLoading(false);
      return;
    }
  }

  // Test Mode 3 & Production: Use magic link with email verification
  console.log("📧 Using magic link flow");
  setLoading(true);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${window.location.origin}/auth-redirect`,
      data: name ? { full_name: name } : undefined,
    },
  });
  
  setLoading(false);
  
  if (error) {
    console.error("❌ Magic link error:", error);
    toast.error(error.message);
  } else {
    console.log("✅ Magic link sent");
    toast.success("Check your email! Click the link in the same browser to continue.");
    navigate("/EmailVerification", { state: { email } });
  }
};
export default Auth;
