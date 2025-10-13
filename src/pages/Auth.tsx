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
  const [step, setStep] = useState<"info" | "verify">("info");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpMethod, setOtpMethod] = useState<"email" | "phone" | null>(null);
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

  const handleSendCode = async (method: "email" | "phone") => {
    if (!fullName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    if (method === "email" && !email.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email",
        variant: "destructive",
      });
      return;
    }

    if (method === "phone" && !phone.trim()) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setOtpMethod(method);

    try {
      const { error } = await supabase.auth.signInWithOtp(
        method === "email" 
          ? { 
              email,
              options: {
                data: {
                  full_name: fullName,
                },
              },
            }
          : { 
              phone,
              options: {
                data: {
                  full_name: fullName,
                },
              },
            }
      );

      if (error) throw error;

      toast({
        title: "Code sent!",
        description: `Verification code sent to your ${method}`,
      });
      setStep("verify");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (otpCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp(
        otpMethod === "email"
          ? { email, token: otpCode, type: "email" }
          : { phone, token: otpCode, type: "sms" }
      );

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Welcome to Bride Buddy! 💍",
          description: "Your account is ready",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderInfoStep = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1"
          autoFocus
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1"
        />
      </div>

      <div className="space-y-3 pt-2">
        <Button 
          onClick={() => handleSendCode("email")}
          className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
          disabled={loading || !fullName.trim() || !email.trim()}
        >
          {loading && otpMethod === "email" ? "Sending..." : "Send Code to Email"}
        </Button>
        <Button 
          onClick={() => handleSendCode("phone")}
          className="w-full bg-gradient-to-r from-accent to-accent/80 hover:opacity-90 transition-opacity"
          disabled={loading || !fullName.trim() || !phone.trim()}
        >
          {loading && otpMethod === "phone" ? "Sending..." : "Send Code to Text"}
        </Button>
      </div>
    </div>
  );

  const renderVerifyStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to your {otpMethod}
        </p>
        <p className="text-sm font-medium">
          {otpMethod === "email" ? email : phone}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
          >
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

        <Button 
          onClick={handleVerifyCode}
          className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
          disabled={loading || otpCode.length !== 6}
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </Button>

        <Button 
          onClick={() => {
            setStep("info");
            setOtpCode("");
            setOtpMethod(null);
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
          <div className="inline-flex items-center justify-center mb-4">
            <img src={logo} alt="Bride Buddy Logo" className="w-48 h-48" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-2">
            {step === "info" ? "Welcome Back, Beautiful Bride 💍" : "Enter Verification Code"}
          </h1>
          <p className="text-muted-foreground">
            {step === "info" 
              ? "Sign in or create your account to continue planning your dream wedding"
              : "Check your email or phone for the verification code"
            }
          </p>
        </div>

        {step === "info" ? renderInfoStep() : renderVerifyStep()}
      </Card>
    </div>
  );
};

export default Auth;
