import React, { useState } from "react";
import { Send, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  type: "user" | "bot";
  text: string;
}

interface SuggestedPrompt {
  text: string;
  action: string;
}

interface ChatProps {
  userName: string;
  userTier: "vip-trial" | "vip-paid" | "free";
  lastTopic?: string;
  onNavigate: (view: string) => void;
}

const Chat: React.FC<ChatProps> = ({ userName, userTier, lastTopic, onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const logoUrl = "bride-buddy-logo-new.png";

  const suggestedPrompts: SuggestedPrompt[] = [
    { text: "Show me my dashboard", action: "dashboard" },
    { text: "Pick up where we left off", action: "continue" },
    { text: "Just need to vent", action: "vent" },
    { text: "To-do today", action: "todo" },
  ];

  const handlePromptClick = (prompt: SuggestedPrompt) => {
    if (prompt.action === "dashboard") {
      onNavigate("dashboard");
      return;
    }

    let botResponse = "";
    if (prompt.action === "continue") {
      botResponse = `Let's continue where we left off! ${
        lastTopic ? `We were talking about ${lastTopic}. 💕` : "What would you like to focus on today?"
      }`;
    } else if (prompt.action === "vent") {
      botResponse = "Go ahead — I’m here for you 😌💭 Sometimes it helps just to get it out.";
    } else if (prompt.action === "todo") {
      botResponse = "Here’s your to-do list for today! ✅ Ready to tackle it?";
    }

    setMessages([
      { type: "user", text: prompt.text },
      { type: "bot", text: botResponse },
    ]);
  };

  // unique chat session ID
  const [sessionId] = useState(() => crypto.randomUUID());

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // ✅ Bonus: navigate to dashboard if typed
    if (text.toLowerCase().includes("dashboard")) {
      onNavigate("dashboard");
      return;
    }

    const userMessage: Message = { type: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      // ✅ Call your Supabase Edge Function via Lovable
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          sessionId,
          message: text,
        },
      });

      if (error) throw error;

      const botResponse: Message = {
        type: "bot",
        text: data?.response || "I’m here to help 💕 What’s on your mind?",
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.message || "Sorry, something went wrong. Please try again.");
      setMessages((prev) => prev.slice(0, -1)); // remove the failed user message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-white shadow-2xl flex flex-col">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-300 to-blue-300 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="Bride Buddy" className="w-10 h-10 rounded-full bg-white p-1" />
          <span className="text-white font-semibold text-sm">Bride Buddy</span>
        </div>
        <button
          onClick={() => onNavigate("dashboard")}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
        >
          <LayoutDashboard className="text-white" size={20} />
        </button>
      </div>

      {/* CHAT WINDOW */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6 px-6">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-purple-400" style={{ fontFamily: "Quicksand, sans-serif" }}>
                Welcome back, {userName}! 💕
              </h2>
              <p className="text-gray-600 text-sm">Ask me anything, or click a quick action below 👇</p>
            </div>

            <div className="w-full max-w-sm space-y-3">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(prompt)}
                  className="w-full bg-white text-purple-400 py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium border-2 border-purple-100 hover:border-purple-300"
                >
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
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
          ))
        )}
      </div>

      {/* INPUT BAR */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-purple-300"
            disabled={loading}
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={loading || !inputValue.trim()}
            className="bg-purple-300 hover:bg-purple-400 p-3 rounded-full transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="text-white" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
