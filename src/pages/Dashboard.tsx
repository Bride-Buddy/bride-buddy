import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import Chat from "@/components/Chat";
import OnboardingDialog from "@/components/OnboardingDialog";
import { Button } from "@/components/ui/button";
import { Heart, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userName, setUserName] = useState<string>("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.full_name) {
          setUserName(profile.full_name);
        }
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (searchParams.get('new') === 'true' && userName) {
      toast({
        title: "All done, " + userName + "! 💖",
        description: "Your personal Bride Buddy account is ready. Everything you add will be saved so we can pick up right where you leave off.",
        duration: 6000,
      });
      // Remove the query parameter
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, userName, navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-accent/20">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Bride Buddy
            </h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {userName && <OnboardingDialog userId={user.id} userName={userName} />}
        <Chat userId={user.id} />
      </main>
    </div>
  );
};

export default Dashboard;