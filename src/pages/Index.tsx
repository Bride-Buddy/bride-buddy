import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Calendar, MessageCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6">
            <Heart className="w-16 h-16 text-primary fill-primary" />
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Bride Buddy
          </h1>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity text-lg px-8 py-6 shadow-[var(--shadow-elegant)]"
          >
            Start Planning for Free
            <Sparkles className="ml-2 w-5 h-5" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
          <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-shadow">
            <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered Chat</h3>
            <p className="text-muted-foreground">
              Chat with our intelligent assistant to get instant answers and personalized suggestions
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-shadow">
            <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Timeline Planning</h3>
            <p className="text-muted-foreground">
              Create and manage your wedding timeline with smart recommendations
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-shadow">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
            <p className="text-muted-foreground">
              Get professional advice on venues, themes, budgets, and more
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
