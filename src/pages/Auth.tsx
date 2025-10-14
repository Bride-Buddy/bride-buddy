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
  const [emailSent, setEmailSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setEmailSent(true);
    toast.success("Check your email for the verification link!");
  };

  const handleSignIn = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setEmailSent(true);
    toast.success("Check your email for the sign-in link!");
  };

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-6">
      <div className="flex-1 flex items-center justify-center">
        <img src={logo} alt="Bride Buddy Logo" className="w-80 h-80 drop-shadow-2xl" />
      </div>

      <div className="w-full space-y-4 pb-8">
        {emailSent ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
            <Mail size={48} className="mx-auto text-purple-400" />
            <h2 className="text-2xl font-bold text-purple-400" style={{ fontFamily: "Quicksand, sans-serif" }}>
              Check Your Email
            </h2>
            <p className="text-gray-600">
              We've sent a verification link to <span className="font-semibold">{email}</span>
            </p>
            <p className="text-sm text-gray-500">Click the link in the email to continue</p>
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail("");
                setName("");
              }}
              className="text-purple-400 font-bold underline hover:text-purple-500 transition-colors mt-4"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <>
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
                {loading ? <Sparkles className="animate-spin" size={20} /> : <Send size={20} />}
                {loading ? "Sending..." : "Send Verification Link"}
              </button>
            </div>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-sm text-center text-purple-400 font-bold underline hover:text-purple-500 transition-colors"
              disabled={loading}
            >
              {isLogin ? "Don't have an account? Sign up here" : "Already have an account? Sign in here"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
