import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/bride-buddy-logo.png";

const Auth = () => {
  const [step, setStep] = useState<"email" | "signup" | "verify">("email");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  // Step 1: handle email submission
  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      toast({ title: "Error", description: "Please enter your email", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const { data: user, error } = await supabase.auth.admin.getUserByEmail(email);
      if (error) throw error;

      if (user) {
        // Returning user
        setIsReturningUser(true);
        await handleSendOtp();
      } else {
        // New user
        setIsReturningUser(false);
        setStep("signup");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: send OTP
  const handleSendOtp = async () => {
    if (!isReturningUser && !fullName.trim()) {
      toast({ title: "Error", description: "Please enter your full name", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: isReturningUser ? undefined : { full_name: fullName },
        },
        type: "otp", // ensures 6-digit code
      });

      if (error) throw error;

      toast({
        title: "Code sent!",
        description: `A 6-digit verification code was sent to ${email}`,
      });
      setStep("verify");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: verify OTP
  const handleVerifyCode = async () => {
    if (otpCode.length !== 6) {
      toast({ title: "Error", description: "Please enter the 6-digit code", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: "email" });
      if (error) throw error;

      if (data.user) {
        toast({ title: "Welcome to Bride Buddy! 💍", description: "Your account is ready" });
        navigate("/");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Render UI for each step
  const renderEmailStep = () => (
    <div className="space-y-4">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        placeholder="your.email@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-1"
        autoFocus
        onKeyPress={(e) => e.key === "Enter" && handleEmailSubmit()}
      />
      <Button onClick={handleEmailSubmit} disabled={loading || !email.trim()} className="w-full">
        {loading ? "Checking..." : "Continue"}
      </Button>
    </div>
  );

  const renderSignupStep = () => (
    <div className="space-y-4">
      <Label>Email</Label>
      <Input value={email} disabled className="mt-1 bg-muted" />
      <Label htmlFor="fullName">Full Name</Label>
      <Input
        id="fullName"
        type="text"
        placeholder="Your full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="mt-1"
        autoFocus
        onKeyPress={(e) => e.key === "Enter" && handleSendOtp()}
      />
      <Button onClick={handleSendOtp} disabled={loading || !fullName.trim()} className="w-full">
        {loading ? "Sending..." : "Verify Email"}
      </Button>
      <Button
        onClick={() => {
          setStep("email");
          setFullName("");
        }}
        variant="ghost"
        className="w-full"
        disabled={loading}
      >
        Change Email
      </Button>
    </div>
  );

  const renderVerifyStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">We sent a 6-digit code to your email</p>
        <p className="text-sm font-medium">{email}</p>
      </div>

      <div className="space-y-4 flex flex-col items-center">
        <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <Button onClick={handleVerifyCode} disabled={loading || otpCode.length !== 6} className="w-full">
          {loading ? "Verifying..." : "Verify & Continue"}
        </Button>

        <Button
          onClick={() => {
            setStep(isReturningUser ? "email" : "signup");
            setOtpCode("");
          }}
          variant="ghost"
          className="w-full"
          disabled={loading}
        >
          Go Back
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/30 p-4">
      <Card className="w-full max-w-md p-8 shadow-[var(--shadow-elegant)]">
        <div className="text-center mb-8">
          <img src={logo} alt="Bride Buddy Logo" className="w-48 h-48 mx-auto mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-2">
            {step === "email"
              ? "Welcome Back, Beautiful Bride 💍"
              : step === "signup"
                ? "Create Your Account"
                : "Enter Verification Code"}
          </h1>
          <p className="text-muted-foreground">
            {step === "email"
              ? "Enter your email to continue planning your dream wedding"
              : step === "signup"
                ? "We just need a few details to get started"
                : "Check your email for the verification code"}
          </p>
        </div>

        {step === "email" ? renderEmailStep() : step === "signup" ? renderSignupStep() : renderVerifyStep()}
      </Card>
    </div>
  );
};

export default Auth;
