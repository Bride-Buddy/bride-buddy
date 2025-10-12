import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/bride-buddy-logo.png";

type SignupStep = "name" | "username" | "password" | "email";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [signupStep, setSignupStep] = useState<SignupStep>("name");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleNextStep = () => {
    if (signupStep === "name" && fullName.trim()) {
      setSignupStep("username");
    } else if (signupStep === "username" && username.trim()) {
      setSignupStep("email");
    } else if (signupStep === "email" && email.trim()) {
      setSignupStep("password");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        // Sign up flow
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: fullName,
            },
          },
        });
        
        if (signUpError) throw signUpError;
        
        if (authData.user) {
          // Update profile with username (profile and timeline are created by trigger)
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ username: username })
            .eq('user_id', authData.user.id);

          if (profileError) {
            console.error('Profile update error:', profileError);
          }
        }
        
        navigate("/dashboard?new=true");
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

  const getStepPrompt = () => {
    if (isLogin) return null;
    
    switch (signupStep) {
      case "name":
        return "What should I call you?";
      case "username":
        return "Pick a username you'll remember";
      case "email":
        return "What's your email address?";
      case "password":
        return "Set a password for your account";
    }
  };

  const renderSignupStep = () => {
    switch (signupStep) {
      case "name":
        return (
          <div>
            <Label htmlFor="fullName">{getStepPrompt()}</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-1"
              placeholder="Enter your name"
              autoFocus
            />
            <Button
              type="button"
              onClick={handleNextStep}
              className="w-full mt-4 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
              disabled={!fullName.trim()}
            >
              Next
            </Button>
          </div>
        );
      case "username":
        return (
          <div>
            <Label htmlFor="username">{getStepPrompt()}</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1"
              placeholder="Choose a username"
              autoFocus
            />
            <Button
              type="button"
              onClick={handleNextStep}
              className="w-full mt-4 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
              disabled={!username.trim()}
            >
              Next
            </Button>
          </div>
        );
      case "email":
        return (
          <div>
            <Label htmlFor="email">{getStepPrompt()}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
              placeholder="your.email@example.com"
              autoFocus
            />
            <Button
              type="button"
              onClick={handleNextStep}
              className="w-full mt-4 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
              disabled={!email.trim()}
            >
              Next
            </Button>
          </div>
        );
      case "password":
        return (
          <div>
            <Label htmlFor="password">{getStepPrompt()}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1"
              placeholder="At least 6 characters"
              autoFocus
            />
            <Button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
              disabled={loading || password.length < 6}
            >
              {loading ? "Creating your account..." : "Create Account"}
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/30 p-4">
      <Card className="w-full max-w-md p-8 shadow-[var(--shadow-elegant)]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={logo} alt="Bride Buddy Logo" className="w-32 h-32" />
          </div>
          <p className="text-muted-foreground">
            {isLogin ? "Welcome back!" : "Let's set up your account"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isLogin ? (
            <>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? "Loading..." : "Sign In"}
              </Button>
            </>
          ) : (
            renderSignupStep()
          )}
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setSignupStep("name");
            }}
            className="text-sm text-primary hover:underline"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
