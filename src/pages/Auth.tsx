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
  const [fullName, setFullName] = useState("");
  const [otpCode, setOtpCode] = useState("");
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

  const handleSendCode = async () => {
    if (!fullName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke("send-email-otp", {
        body: {
          action: "send",
          email,
          fullName,
        },
      });

      if (error) throw error;

      toast({
        title: "Code sent!",
        description: "Check your email for the 6-digit code",
      });
      setStep("verify");
    } catch (error: any) {
      console.error("Error sending code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Verify OTP via Edge function
      const { data, error } = await supabase.functions.invoke("send-email-otp", {
        body: {
          action: "verify",
          email,
          otpCode,
          fullName,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to verify code");
      }

      if (data?.session) {
        // Set the session from the Edge function response
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.properties.access_token,
          refresh_token: data.session.properties.refresh_token,
        });

        if (sessionError) {
          throw new Error("Failed to establish session");
        }

        toast({
          title: "Welcome to Bride Buddy! 💍",
          description: "Your account is ready",
        });
        navigate("/");
      } else {
        throw new Error("Invalid verification response");
      }
    } catch (error: any) {
      console.error("Error verifying code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify code",
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

      <div className="pt-2">
        <Button 
          onClick={handleSendCode}
          className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
          disabled={loading || !fullName.trim() || !email.trim()}
        >
          {loading ? "Sending..." : "Send Verification Code"}
        </Button>
      </div>
    </div>
  );

  const renderVerifyStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to your email
        </p>
        <p className="text-sm font-medium">
          {email}
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
          <div className="inline-flex items-center justify-center mb-6">
            <img src={logo} alt="Bride Buddy Logo" className="w-64 h-64" />
          </div>
        </div>

        {step === "info" ? renderInfoStep() : renderVerifyStep()}
      </Card>
    </div>
  );
};

export default Auth;
