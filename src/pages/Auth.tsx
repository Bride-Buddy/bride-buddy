import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/bride-buddy-logo-ring.png";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
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
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setShowOtpInput(true);
    toast.success("Check your email for the verification code!");
  };

  const handleSignIn = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setShowOtpInput(true);
    toast.success("Check your email for the verification code!");
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email_otp",
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Successfully verified!");
  };

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-6">
      <div className="flex-1 flex items-center justify-center">
        <img src={logo} alt="Bride Buddy Logo" className="w-80 h-80 drop-shadow-2xl" />
      </div>

      <div className="w-full space-y-4 pb-8">
        {showOtpInput ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-purple-400" style={{ fontFamily: "Quicksand, sans-serif" }}>
                Enter Verification Code
              </h2>
              <p className="text-gray-600 text-sm">
                We sent a 6-digit code to <span className="font-semibold">{email}</span>
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-purple-300 to-blue-300 text-white py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Sparkles className="animate-spin" size={20} /> : <Send size={20} />}
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              onClick={() => {
                setShowOtpInput(false);
                setOtp("");
                setEmail("");
                setName("");
              }}
              className="text-purple-400 font-bold underline hover:text-purple-500 transition-colors text-sm w-full text-center"
              disabled={loading}
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
                {loading ? "Sending..." : "Send Verification Code"}
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
