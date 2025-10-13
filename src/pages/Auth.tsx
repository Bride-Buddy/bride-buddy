import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/bride-buddy-logo-ring.png";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [step, setStep] = useState<"form" | "sent">("form");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
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

  // Send magic link
  const handleSendMagicLink = async () => {
    if (!email.trim()) {
      toast({ title: "Error", description: "Please enter your email", variant: "destructive" });
      return;
    }

    if (mode === "signup" && !fullName.trim()) {
      toast({ title: "Error", description: "Please enter your full name", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: mode === "signup" ? { full_name: fullName } : undefined,
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      toast({
        title: "Check your email!",
        description: `We sent a magic link to ${email}`,
      });
      setStep("sent");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };



  // Render form based on mode
  const renderFormStep = () => (
    <div className="space-y-4">
      {mode === "signup" && (
        <>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1"
            autoFocus
            onKeyPress={(e) => e.key === "Enter" && handleSendMagicLink()}
          />
        </>
      )}
      
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        placeholder="your.email@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-1"
        autoFocus={mode === "signin"}
        onKeyPress={(e) => e.key === "Enter" && handleSendMagicLink()}
      />
      
      <Button 
        onClick={handleSendMagicLink} 
        disabled={loading || !email.trim() || (mode === "signup" && !fullName.trim())} 
        className="w-full"
      >
        {loading ? "Sending..." : "Send Magic Link"}
      </Button>

      <div className="text-center">
        <Button
          onClick={() => {
            setMode(mode === "signup" ? "signin" : "signup");
            setFullName("");
            setEmail("");
          }}
          variant="ghost"
          className="w-full"
          disabled={loading}
        >
          {mode === "signup" ? "Already have an account? Sign in" : "Don't have an account? Create one"}
        </Button>
      </div>
    </div>
  );


  const renderSentStep = () => (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <p className="text-lg font-medium">Check your email!</p>
        <p className="text-sm text-muted-foreground">
          We sent a magic link to <span className="font-medium">{email}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Click the link in your email to sign in.
        </p>
      </div>

      <Button
        onClick={() => {
          setStep("form");
          setFullName("");
          setEmail("");
        }}
        variant="ghost"
        className="w-full"
        disabled={loading}
      >
        Use a different email
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/30 p-4">
      <Card className="w-full max-w-md p-8 shadow-[var(--shadow-elegant)]">
        <div className="text-center mb-8">
          <img src={logo} alt="Bride Buddy Logo" className="w-48 h-48 mx-auto mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-2">
            {step === "form"
              ? mode === "signup" 
                ? "Create Your Account 💍"
                : "Welcome Back, Beautiful Bride 💍"
              : "Check Your Email"}
          </h1>
          <p className="text-muted-foreground">
            {step === "form"
              ? mode === "signup"
                ? "Let's get started planning your dream wedding"
                : "Enter your email to continue planning"
              : "Click the magic link to sign in"}
          </p>
        </div>

        {step === "form" ? renderFormStep() : renderSentStep()}
      </Card>
    </div>
  );
};

export default Auth;
