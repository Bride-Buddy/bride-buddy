// ChatbotDashboard.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid } from "lucide-react";

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
      text: "View Dashboard",
      action: () => navigate("/bride-dashboard"),
    },
    {
      text: "Pick up where we left off",
      action: () =>
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, text: "Great! Let’s continue from our last chat.", fromAI: true },
        ]),
    },
    {
      text: "I need to vent",
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
      { id: prev.length + 2, text: "Thanks for your message! Here’s a sample AI reply.", fromAI: true },
    ]);
    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatStarted]);

  if (!isChatStarted) {
    // Landing state
    return (
      <div className="flex flex-col h-screen bg-white items-center justify-between p-4">
        {/* Big logo top 1/3 */}
        <div className="flex-1 flex items-center justify-center">
          <img src="/logo.png" alt="Lovable Logo" className="h-1/3 object-contain" />
        </div>

        {/* Input in middle */}
        <div className="w-full max-w-md flex flex-col gap-4 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSendMessage}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600 transition"
          >
            Send
          </button>

          {/* Suggested prompts */}
          <div className="flex flex-col gap-2 w-full mt-4">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt.text}
                onClick={() => startChat(prompt.action)}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
              >
                {prompt.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Chat interface state
  return (
    <div className="chatbot-dashboard relative flex flex-col h-screen bg-white">
      {/* Top bar with logo left + dashboard icon right */}
      <div className="flex justify-between items-center p-4 bg-gray-50 shadow-md">
        <img src="/logo.png" alt="Lovable Logo" className="h-8 w-auto" />
        <button
          onClick={() => navigate("/bride-dashboard")}
          className="text-gray-700 hover:text-blue-500 focus:outline-none"
          aria-label="Open Dashboard"
        >
          <LayoutGrid size={24} />
        </button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded max-w-xs break-words ${
              msg.fromAI ? "bg-gray-200 self-start" : "bg-blue-500 text-white self-end"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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
