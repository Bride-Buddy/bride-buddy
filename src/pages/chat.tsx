import React, { useState } from "react";
import { Send, LayoutDashboard } from "lucide-react";

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
  onPromptClick?: (action: string) => void;
}

const Chat: React.FC<ChatProps> = ({ userName, userTier, lastTopic, onNavigate, onPromptClick }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  const logoUrl =
    "https://cdn.sanity.io/images/ot0hy8f4/production/c6a6e7f9b9e8f0e0e0e0e0e0e0e0e0e0e0e0e0e0-1024x1024.png";

  const suggestedPrompts: SuggestedPrompt[] = [
    { text: "Show me my dashboard", action: "dashboard" },
    { text: "Pick up where we left off", action: "continue" },
    { text: "Just need to vent", action: "vent" },
    { text: "To-do today", action: "todo" },
  ];

  const isFreeUser = userTier === "free";
  const isVIPAccess = userTier === "vip-trial" || userTier === "vip-paid";

  const handlePromptClick = (prompt: SuggestedPrompt) => {
    if (prompt.action === "dashboard") {
      onNavigate("dashboard");
      return;
    }

    let botResponse = "";
    if (prompt.action === "continue") {
      botResponse = `Let's keep our progress going! Do you want to continue discussing *${lastTopic}* or is there something else on your mind?`;
    } else if (prompt.action === "vent") {
      botResponse = "That's exactly what I'm here for! Let it out, you can't hurt my feelings 😌";
    } else if (prompt.action === "todo") {
      botResponse =
        "Here's what I have lined up for you today! n\n\n\n\n\n\n\n\n\n I'm here if you need help with any of these!";
    }

    setMessages([
      { type: "user", text: prompt.text },
      { type: "bot", text: botResponse },
    ]);

    if (onPromptClick) {
      onPromptClick(prompt.action);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { type: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response - in production, this would call Claude API
    setTimeout(() => {
      const botResponse = `I hear you! Let me help you with that. Tell me more about what you're thinking regarding "${text}"?`;
      setMessages((prev) => [...prev, { type: "bot", text: botResponse }]);
    }, 1000);
  };

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-white shadow-2xl flex flex-col">
      <div className="bg-gradient-to-r from-purple-300 to-blue-300 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="Bride Buddy" className="w-10 h-10 rounded-full bg-white p-1" />
          <span className="text-white font-semibold text-sm">Bride Buddy</span>
        </div>
        {isVIPAccess && (
          <button
            onClick={() => onNavigate("dashboard")}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
          >
            <LayoutDashboard className="text-white" size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6 px-6">
            <div className="text-center space-y-3">
              {!isFreeUser ? (
                <h2 className="text-2xl font-bold text-purple-400" style={{ fontFamily: "Quicksand, sans-serif" }}>
                  Welcome back, {userName}! 💕
                </h2>
              ) : (
                <h2 className="text-2xl font-bold text-purple-400" style={{ fontFamily: "Quicksand, sans-serif" }}>
                  Hi there! 💕
                </h2>
              )}
            </div>

            <div className="w-full max-w-sm space-y-4">
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <input
                  type="text"
                  placeholder={
                    isFreeUser
                      ? "Ask me anything about wedding planning..."
                      : "Tell me where you want to start today, or click a suggested prompt below"
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-300 text-gray-700"
                />
              </div>

              {!isFreeUser && (
                <div className="space-y-3">
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
              )}
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

      {messages.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-purple-300"
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              className="bg-purple-300 hover:bg-purple-400 p-3 rounded-full transition-all shadow-md"
            >
              <Send className="text-white" size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
