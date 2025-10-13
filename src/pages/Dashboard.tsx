// ChatbotDashboard.tsx — Bride Buddy Pastel Restyle 💍
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";

interface Message {
  id: number;
  text: string;
  fromAI: boolean;
}

const ChatbotDashboard = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const suggestedPrompts = [
    {
      text: "View My Dashboard",
      action: () => navigate("/bride-dashboard"),
    },
    {
      text: "Pick up where we left off",
      action: () =>
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, text: "Welcome back 💕 Let’s continue from where we stopped.", fromAI: true },
        ]),
    },
    {
      text: "I need to vent",
      action: () =>
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: "It’s okay to vent. Take a deep breath 💗 I’m here to listen, no judgment.",
            fromAI: true,
          },
        ]),
    },
  ];

  const startChat = (action?: () => void) => {
    setIsChatStarted(true);
    if (action) action();
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    if (!isChatStarted) setIsChatStarted(true);

    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, text: input, fromAI: false },
      {
        id: prev.length + 2,
        text: "Thank you for sharing 💬 Here’s a little guidance from me...",
        fromAI: true,
      },
    ]);
    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatStarted]);

  // === Initial landing screen ===
  if (!isChatStarted) {
    return (
      <div className="flex flex-col h-screen bg-white items-center justify-between p-6 font-[Poppins]">
        {/* Logo + tagline */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <img
            src="/Contemporary Bride Buddy Logo with Pastel Colors.png"
            alt="Bride Buddy Logo"
            className="h-40 object-contain mb-4 drop-shadow-sm"
          />
          <p className="text-[#6B6B83] text-lg italic">Your calm, caring wedding companion 💍</p>
        </div>

        {/* Input + prompts */}
        <div className="w-full max-w-md flex flex-col gap-4 items-center mb-8">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            className="w-full border border-[#D4E1F4] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#AFCBFF]"
          />
          <button
            onClick={handleSendMessage}
            className="w-full bg-[#AFCBFF] text-gray-800 px-4 py-3 rounded-xl hover:bg-[#91B4F2] transition font-semibold"
          >
            Send
          </button>

          <div className="flex flex-col gap-2 w-full mt-4">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt.text}
                onClick={() => startChat(prompt.action)}
                className="w-full bg-[#C9C7F7] text-gray-800 py-2 rounded-xl hover:bg-[#B5B3F2] transition font-medium"
              >
                {prompt.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // === Chat interface ===
  return (
    <div className="chatbot-dashboard relative flex flex-col h-screen bg-white font-[Poppins]">
      {/* Top bar */}
      <div className="flex justify-between items-center p-4 bg-[#EAF2FF] shadow-sm">
        <img
          src="/Contemporary Bride Buddy Logo with Pastel Colors.png"
          alt="Bride Buddy Logo"
          className="h-8 w-auto"
        />
        <button
          onClick={() => navigate("/bride-dashboard")}
          className="bg-[#AFCBFF] text-white p-2 rounded-full shadow hover:bg-[#91B4F2] transition"
          aria-label="Open Dashboard"
        >
          <LayoutGrid size={20} />
        </button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gradient-to-b from-[#FFFFFF] to-[#F8F9FF]">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-3 rounded-2xl max-w-[75%] text-sm leading-relaxed ${
              msg.fromAI ? "bg-[#EAF2FF] text-gray-700 self-start" : "bg-[#AFCBFF] text-white self-end"
            }`}
          >
            {msg.text}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-4 bg-[#F4F6FB] flex gap-2 items-center border-t border-[#E0E7F5]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-1 border border-[#D4E1F4] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#AFCBFF]"
        />
        <button
          onClick={handleSendMessage}
          className="bg-[#AFCBFF] text-gray-800 px-4 py-2 rounded-xl hover:bg-[#91B4F2] transition font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatbotDashboard;
