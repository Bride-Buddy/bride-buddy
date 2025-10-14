import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/bride-buddy-logo-ring.png";
import { TEST_MODE_CONFIG } from "@/config/testMode";
const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // --- Listen for auth state changes ---
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/AuthRedirect"); // 🔁 Send all logged-in users to redirect logic
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
    setLoading(true);
    const {
      error
    } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/AuthRedirect`,
        data: name ? {
          full_name: name
        } : undefined
      }
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      // Navigate to verification page instead of showing toast
      navigate("/EmailVerification", {
        state: {
          email
        }
      });
    }
  };
  return <div className="w-full h-screen max-w-md mx-auto bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-6">
      {/* Test Mode Indicator */}
      {TEST_MODE_CONFIG.showTestModeIndicator && (
        <div className="fixed top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-lg shadow-lg font-bold text-sm z-50">
          🧪 TEST MODE
        </div>
      )}
      
      <div className="flex-1 flex items-center justify-center">
        <img src={logo} alt="Bride Buddy Logo" className="w-80 h-80 drop-shadow-2xl" />
      </div>

      <div className="w-full space-y-4 pb-8">
        <h2 className="text-2xl font-bold text-center text-purple-400 mb-2" style={{
        fontFamily: "Quicksand, sans-serif"
      }}>
          {isLogin ? "Welcome Back, Returning User! 💕" : "Create Your Account"}
        </h2>

        {!isLogin && <div className="bg-gradient-to-r from-purple-200 to-blue-200 rounded-xl p-4 mb-4 text-center">
            <p className="text-purple-600 mb-1 font-normal text-base">
              Start Your {TEST_MODE_CONFIG.trialDurationDays}-Day FREE Trial 
            </p>
            <p className="text-purple-500 text-xs">No credit card required • Cancel anytime</p>
          </div>}

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          {!isLogin && <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Name</label>
              <input type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-300 text-gray-700" disabled={loading} />
            </div>}

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Email</label>
            <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} onKeyPress={e => e.key === "Enter" && handleMagicLink()} className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-300 text-gray-700" disabled={loading} />
          </div>

          <button onClick={handleMagicLink} disabled={loading} className="w-full bg-gradient-to-r from-purple-300 to-blue-300 text-white py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Sparkles className="animate-spin" size={20} /> : <Send size={20} />}
            {loading ? "Sending..." : isLogin ? "Send Login Link" : "Start Free Trial"}
          </button>
        </div>

        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-sm text-center text-purple-400 font-bold underline hover:text-purple-500 transition-colors" disabled={loading}>
          {isLogin ? "Don't have an account? Sign up here" : "Already have an account? Sign in here"}
        </button>
      </div>
    </div>;
};
export default Auth;