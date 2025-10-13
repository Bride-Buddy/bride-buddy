import { useState } from "react";
import { LayoutDashboard, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/bride-buddy-logo.png";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
}

export default function App() {
  const [isChatActive, setIsChatActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: "user",
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
    setIsChatActive(true);

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm here to help! How can I assist you with your wedding planning today?",
        sender: "assistant",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  if (!isChatActive) {
    return (
      <div className="h-screen w-full bg-gradient-to-b from-blue-50 to-white flex flex-col px-6">
        {/* Logo Section - Top 1/3 */}
        <div className="flex items-center justify-center" style={{ height: "33.33%" }}>
          <img src={logo} alt="Bride Buddy" className="w-64 h-64 object-contain" />
        </div>

        {/* Input and Prompts Section - Middle */}
        <div className="flex-1 flex flex-col justify-center gap-6 pb-20">
          <form onSubmit={handleInputSubmit} className="relative">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="✨"
              className="w-full h-14 px-6 pr-14 rounded-full border-2 border-purple-200 focus:border-purple-400 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </form>

          {/* Suggested Prompts */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => handlePromptClick("see my progress")}
              variant="outline"
              className="w-full h-12 rounded-full border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              see my progress
            </Button>
            <Button
              onClick={() => handlePromptClick("pick up where we left off")}
              variant="outline"
              className="w-full h-12 rounded-full border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              pick up where we left off
            </Button>
            <Button
              onClick={() => handlePromptClick("I just need to vent")}
              variant="outline"
              className="w-full h-12 rounded-full border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              I just need to vent
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-white flex flex-col">
      {/* Header with Logo and Dashboard Button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <img src={logo} alt="Bride Buddy" className="w-12 h-12 object-contain" />
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="w-10 h-10 rounded-full bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-colors"
        >
          <LayoutDashboard className="w-5 h-5 text-purple-600" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                message.sender === "user"
                  ? "bg-purple-500 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 px-4 py-4">
        <form onSubmit={handleInputSubmit} className="relative">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="w-full h-12 px-4 pr-12 rounded-full border-2 border-gray-200 focus:border-purple-400 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
