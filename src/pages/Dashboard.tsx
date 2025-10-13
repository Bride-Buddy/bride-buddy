// ChatbotDashboard.jsx
// ChatbotDashboard.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid } from "lucide-react";

interface Message {
  id: number;
  text: string;
  fromAI: boolean;
  isSuggested?: boolean;
  action?: () => void;
}

const ChatbotDashboard = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi there! I’m ready to help you.", fromAI: true },
    {
      id: 2,
      text: "View Dashboard",
      fromAI: true,
      isSuggested: true,
      action: () => navigate("/bride-dashboard"),
    },
    {
      id: 3,
      text: "Pick up where we left off",
      fromAI: true,
      isSuggested: true,
      action: () =>
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: "Great! Let’s continue from our last chat.",
            fromAI: true,
          },
        ]),
    },
    {
      id: 4,
      text: "I need to vent",
      fromAI: true,
      isSuggested: true,
      action: () =>
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: "It’s okay to vent. Take a deep breath ❤️ I’m here to listen.",
            fromAI: true,
          },
        ]),
    },
  ]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, text: input, fromAI: false },
      { id: prev.length + 2, text: "Thanks for your message! Here’s a sample AI reply.", fromAI: true },
    ]);

    setInput("");
  };

  const handleSuggestedClick = (msg: Message) => {
    if (msg.isSuggested && msg.action) {
      msg.action();
      // remove suggested prompt after clicking
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    }
  };

  return (
    <div className="chatbot-dashboard relative flex flex-col h-screen bg-white">
      {/* Top bar with icon */}
      <div className="flex justify-end p-4 bg-gray-50 shadow-md">
        <button
          onClick={() => navigate("/bride-dashboard")}
          className="text-gray-700 hover:text-blue-500 focus:outline-none"
          aria-label="Open Dashboard"
        >
          <LayoutGrid size={24} />
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => handleSuggestedClick(msg)}
            className={`p-3 rounded max-w-xs break-words ${
              msg.fromAI
                ? msg.isSuggested
                  ? "bg-blue-500 text-white cursor-pointer hover:bg-blue-600 self-start"
                  : "bg-gray-200 self-start"
                : "bg-blue-500 text-white self-end"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <div className="p-4 bg-gray-50 flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatbotDashboard;
