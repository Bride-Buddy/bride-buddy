import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardView from "./DashboardView";
import { TrialBanner } from "./TrialBanner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ChatProps {
  userId: string;
}

const Chat = ({ userId }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [dashboardView, setDashboardView] = useState<"overview" | "todo" | "finance" | "vendors" | "timeline" | "checklist" | null>(null);
  const [trialStartDate, setTrialStartDate] = useState<string | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("trial");
  const [messagesToday, setMessagesToday] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, trial_start_date, subscription_tier, messages_today, last_message_date')
        .eq('user_id', userId)
        .single();
      
      if (profile) {
        setUserName(profile.full_name || "");
        setTrialStartDate(profile.trial_start_date);
        setSubscriptionTier(profile.subscription_tier || "trial");
        
        // Check if we need to reset messages_today
        const today = new Date().toISOString().split('T')[0];
        const lastMessageDate = profile.last_message_date;
        
        if (lastMessageDate !== today) {
          // Reset messages for new day
          await supabase
            .from('profiles')
            .update({ messages_today: 0, last_message_date: today })
            .eq('user_id', userId);
          setMessagesToday(0);
        } else {
          setMessagesToday(profile.messages_today || 0);
        }
      }
    };

    fetchUserProfile();
    createOrGetSession();
  }, [userId]);

  useEffect(() => {
    if (sessionId) {
      loadMessages();
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createOrGetSession = async () => {
    const { data: sessions, error: fetchError } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      toast({
        title: "Error",
        description: "Failed to load chat session",
        variant: "destructive",
      });
      return;
    }

    if (sessions && sessions.length > 0) {
      setSessionId(sessions[0].id);
      setIsReturningUser(true);
    } else {
      const { data: newSession, error: createError } = await supabase
        .from("chat_sessions")
        .insert({ user_id: userId })
        .select()
        .single();

      if (createError || !newSession) {
        toast({
          title: "Error",
          description: "Failed to create chat session",
          variant: "destructive",
        });
        return;
      }

      setSessionId(newSession.id);
      setIsReturningUser(false);
    }
  };

  const loadMessages = async () => {
    if (!sessionId) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
      return;
    }

    const typedMessages: Message[] = (data || []).map(msg => ({
      id: msg.id,
      role: msg.role as "user" | "assistant",
      content: msg.content,
      created_at: msg.created_at,
    }));

    setMessages(typedMessages);
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || loading) return;

    // Check message limits for free tier
    if (subscriptionTier === 'free' && messagesToday >= 20) {
      toast({
        title: "Message Limit Reached 💝",
        description: "You've used all 20 messages today! Upgrade to VIP for unlimited messages ✨",
        variant: "destructive",
      });
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from("messages")
        .insert({
          session_id: sessionId,
          role: "user",
          content: userMessage,
        });

      if (insertError) throw insertError;

      // Increment message count for free tier users
      if (subscriptionTier === 'free') {
        const newCount = messagesToday + 1;
        await supabase
          .from('profiles')
          .update({ 
            messages_today: newCount,
            last_message_date: new Date().toISOString().split('T')[0]
          })
          .eq('user_id', userId);
        setMessagesToday(newCount);
      }

      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          sessionId,
          message: userMessage,
        },
      });

      if (error) throw error;

      await loadMessages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickReply = (action: string, view?: "overview" | "todo" | "finance" | "vendors" | "timeline" | "checklist") => {
    if (view) {
      setDashboardView(view);
    } else {
      setInput(action);
    }
  };

  const handleUpgrade = () => {
    toast({
      title: "Upgrade to VIP ✨",
      description: "Contact us to upgrade your account to VIP and unlock unlimited access!",
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] space-y-4">
      <TrialBanner 
        trialStartDate={trialStartDate} 
        subscriptionTier={subscriptionTier}
        onUpgrade={handleUpgrade}
      />
      <DashboardView userId={userId} view={dashboardView} onViewChange={setDashboardView} />
      
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 ? (
          <Card className="p-8 text-center bg-gradient-to-br from-card to-accent/10 border-none shadow-[var(--shadow-elegant)]">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
            {isReturningUser && userName ? (
              <>
                <h2 className="text-2xl font-bold mb-2">
                  Welcome back, {userName}! 🚗💍
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your wedding adventure continues. What would you like to do today?
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    onClick={() => handleQuickReply("Show me my dashboard", "overview")}
                    variant="outline"
                    className="hover:bg-primary/10"
                  >
                    View Dashboard
                  </Button>
                  <Button
                    onClick={() => handleQuickReply("Show my full checklist", "checklist")}
                    variant="outline"
                    className="hover:bg-primary/10"
                  >
                    Full Checklist
                  </Button>
                  <Button
                    onClick={() => handleQuickReply("What are my tasks for today?", "todo")}
                    variant="outline"
                    className="hover:bg-primary/10"
                  >
                    To-Do Today
                  </Button>
                  <Button
                    onClick={() => handleQuickReply("Show my finance tracker", "finance")}
                    variant="outline"
                    className="hover:bg-primary/10"
                  >
                    Finance Tracker
                  </Button>
                  <Button
                    onClick={() => handleQuickReply("Show my vendor tracker", "vendors")}
                    variant="outline"
                    className="hover:bg-primary/10"
                  >
                    Vendor Tracker
                  </Button>
                  <Button
                    onClick={() => handleQuickReply("Show my wedding timeline", "timeline")}
                    variant="outline"
                    className="hover:bg-primary/10"
                  >
                    Wedding Timeline
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2">Welcome to Your Wedding Planning Assistant</h2>
                <p className="text-muted-foreground">
                  I'm here to help you plan every detail of your special day. Ask me anything about venues, themes, budgets, or timelines!
                </p>
              </>
            )}
          </Card>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground border-none shadow-[var(--shadow-elegant)]"
                    : "bg-card border-border"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </Card>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <Card className="max-w-[80%] p-4 bg-card border-border">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <Card className="p-4 bg-card/80 backdrop-blur-sm border-border shadow-[var(--shadow-elegant)]">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about venues, themes, budgets, timelines..."
            className="resize-none"
            rows={2}
            disabled={loading}
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Chat;