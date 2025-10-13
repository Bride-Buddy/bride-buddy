import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Mail, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/bride-buddy-logo-ring.png";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.user) {
      toast.success("Account created! Redirecting...");
      // Auto-confirm is enabled, so user will be logged in immediately
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Welcome back!");
  };

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-6">
      <div className="flex-1 flex items-center justify-center">
        <img src={logo} alt="Bride Buddy Logo" className="w-80 h-80 drop-shadow-2xl" />
      </div>

      <div className="w-full space-y-4 pb-8">
        <h2
          className="text-2xl font-bold text-center text-purple-400 mb-6"
          style={{ fontFamily: "Quicksand, sans-serif" }}
        >
          {isLogin ? "Welcome Back!" : "Create Your Account"}
        </h2>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Name</label>
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
            <label className="block text-sm font-semibold text-gray-600 mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-300 text-gray-700"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (isLogin ? handleSignIn() : handleSignUp())}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-300 text-gray-700"
              disabled={loading}
            />
          </div>

          <button
            onClick={isLogin ? handleSignIn : handleSignUp}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-300 to-blue-300 text-white py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Sparkles className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </div>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-sm text-center text-gray-500 hover:text-purple-400 transition-colors"
          disabled={loading}
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
