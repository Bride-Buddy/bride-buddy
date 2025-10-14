import React, { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import logoUrl from "@/assets/bride-buddy-logo-new.png";

interface Message {
  type: "user" | "bot";
  text: string;
}

interface OnboardingChatProps {
  userId: string;
  userName: string;
}

const OnboardingChat: React.FC<OnboardingChatProps> = ({ userId: propUserId, userName: propUserName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initSession = async () => {
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({ user_id: propUserId, title: "Onboarding Session" })
        .select()
        .single();

      if (error) {
        console.error("Error creating session:", error);
        toast.error("Failed to start onboarding");
        return;
      }

      setSessionId(data.id);
    };

    initSession();
  }, [propUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartOnboarding = async () => {
    setShowPrompt(false);
    await handleSendMessage("Let's get this party planning started! 🎉", true);
  };

  const handleSendMessage = async (text: string, isSystemTrigger = false) => {
    if (!text.trim() || !sessionId) return;

    const userMessage: Message = { type: "user", text };
    if (!isSystemTrigger) {
      setMessages((prev) => [...prev, userMessage]);
    }
    setInputValue("");
    setIsLoading(true);

    try {
      // Save user message
      const { error: userMsgError } = await supabase.from("messages").insert({
        session_id: sessionId,
        role: "user",
        content: text,
      });

      if (userMsgError) throw userMsgError;

      // Get auth token for the edge function
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      // Call chat edge function with onboarding flag
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          sessionId,
          message: text,
          isOnboarding: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      // Fetch the latest bot message from the database
      const { data: latestMessages, error: fetchError } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", sessionId)
        .eq("role", "assistant")
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (latestMessages && latestMessages.length > 0) {
        const botMessage = latestMessages[0];
        const botResponse: Message = {
          type: "bot",
          text: botMessage.content,
        };
        setMessages((prev) => [...prev, botResponse]);

        // Check if onboarding is complete
        if (botMessage.content.includes("ONBOARDING_COMPLETE")) {
          setTimeout(() => {
            toast.success("Your personalized dashboard is ready! 🎉");
            navigate("/chat");
          }, 2000);
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.message || "Sorry, I had trouble responding. Please try again.");
      if (!isSystemTrigger) {
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-white shadow-2xl flex flex-col">
      <div className="bg-gradient-to-r from-purple-300 to-blue-300 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="Bride Buddy" className="w-20 h-20 object-contain" />
          <span className="text-white font-semibold text-sm">Bride Buddy</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {showPrompt && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6 px-6">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-purple-400" style={{ fontFamily: "Quicksand, sans-serif" }}>
                Welcome, {propUserName}! 💕
              </h2>
              <p className="text-gray-600">I'm so excited to help you plan your big day!</p>
            </div>

            <div className="w-full max-w-sm">
              <button
                onClick={handleStartOnboarding}
                className="w-full bg-gradient-to-r from-purple-400 to-blue-400 text-white py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg font-medium"
              >
                Let's get this party planning started! 🎉
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    msg.type === "user"
                      ? "bg-purple-300 text-white rounded-br-sm"
                      : "bg-white text-gray-800 shadow-md rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 shadow-md rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {!showPrompt && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your answer..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage(inputValue)}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-purple-300"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              className="bg-purple-300 hover:bg-purple-400 p-3 rounded-full transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="text-white" size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingChat;
