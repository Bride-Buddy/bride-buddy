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
  const [checkingSession, setCheckingSession] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // --- Check for existing session on mount (like Gmail/Facebook) ---
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // User is already logged in - redirect them automatically
          console.log("Active session found, redirecting...");
          navigate("/auth-redirect");
        } else {
          // No active session - show auth form
          setCheckingSession(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate]);

  // --- Listen for auth state changes ---
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Session created - user logged in
        console.log("Auth state changed - session active");
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

    if (!isLogin && !name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    const config = getCurrentModeConfig();

    // Test Mode 1 & 2: Skip email verification completely
    if (config.skipEmailVerification) {
      setLoading(true);

      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: "testmode123",
      });

      // If user doesn't exist, sign them up
      if (signInError) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: "testmode123",
          options: {
            data: name ? { full_name: name } : undefined,
          },
        });

        if (signUpError) {
          toast.error(signUpError.message);
          setLoading(false);
          return;
        }

        toast.success("Account created! Redirecting...");
        // Session is automatically created and stored by Supabase
      } else {
        toast.success("Welcome back! Redirecting...");
        // Session is automatically created and stored by Supabase
      }

      setLoading(false);
      // Auth state change listener will handle redirect
      return;
    }

    // Test Mode 3 & Production: Use magic link with email verification
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth-redirect`,
        data: name
          ? {
              full_name: name,
            }
          : undefined,
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      const message = isLogin
        ? "Check your email! Click the link to sign in."
        : "Check your email! Click the link to start your free trial.";
      toast.success(message);

      navigate("/EmailVerification", {
        state: {
          email,
          isNewUser: !isLogin,
        },
      });
    }
  };

  const config = getCurrentModeConfig();

  // Show loading screen while checking for existing session
  if (checkingSession) {
    return (
      <div className="w-full h-screen max-w-md mx-auto bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-6">
        <img src={logo} alt="Bride Buddy Logo" className="w-80 h-80 drop-shadow-2xl animate-pulse" />
        <p className="text-purple-400 font-semibold mt-4">Checking your session...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-6">
      {/* Test Mode Indicator */}
      {showTestModeIndicator && (
        <div className="fixed top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-lg shadow-lg font-bold text-sm z-50">
          🧪 TEST MODE
        </div>
      )}

      <div className="flex-1 flex items-center justify-center">
        <img src={logo} alt="Bride Buddy Logo" className="w-80 h-80 drop-shadow-2xl" />
      </div>

      <div className="w-full space-y-4 pb-8">
        <h2
          className="text-2xl font-bold text-center text-purple-400 mb-2"
          style={{
            fontFamily: "Quicksand, sans-serif",
          }}
        >
          {isLogin ? "Welcome Back! 💕" : "Start Planning Your Dream Wedding"}
        </h2>

        {!isLogin && (
          <div className="bg-gradient-to-r from-purple-200 to-blue-200 rounded-xl p-4 mb-4 text-center">
            <p className="text-purple-600 mb-1 font-normal text-base">
              Start Your{" "}
              {(() => {
                if ("trialDurationDays" in config) return `${config.trialDurationDays}-Day`;
                if ("trialDurationMinutes" in config) return `${config.trialDurationMinutes}-Minute`;
                if ("trialDurationSeconds" in config) return `${config.trialDurationSeconds}-Second`;
                return "7-Day";
              })()}{" "}
              FREE Trial
            </p>
            <p className="text-purple-500 text-xs">No credit card required • Cancel anytime</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-300 text-gray-700"
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleMagicLink()}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-300 text-gray-700"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <button
            onClick={handleMagicLink}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-300 to-blue-300 text-white py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Sparkles className="animate-spin" size={20} /> : <Send size={20} />}
            {loading ? "Sending magic link..." : isLogin ? "Send Sign In Link" : "Start Free Trial"}
          </button>

          <div className="text-center text-xs text-gray-500 pt-2">
            {isLogin ? (
              <p>We'll send a magic link to your email - no password needed!</p>
            ) : (
              <p>Click the link in your email to instantly access your account</p>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-sm text-center text-purple-400 font-bold underline hover:text-purple-500 transition-colors"
          disabled={loading}
        >
          {isLogin ? "New to Bride Buddy? Claim your 7-day Free Trial below" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
