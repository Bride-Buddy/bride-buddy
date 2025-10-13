import React, { useState, useEffect } from "react";
import { Calendar, Send, ArrowLeft } from "lucide-react";

const BrideBuddyApp = () => {
  const [view, setView] = useState("landing");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [weddingDate] = useState(new Date("2026-06-20"));
  const [engagementDate] = useState(new Date("2025-01-15"));

  const logoUrl =
    "https://cdn.sanity.io/images/ot0hy8f4/production/c6a6e7f9b9e8f0e0e0e0e0e0e0e0e0e0e0e0e0e0-1024x1024.png";

  const suggestedPrompts = ["Show me my progress", "Pick up where we left off", "Just need to vent", "To-do today"];

  const categories = [
    { name: "Venue", emoji: "🏛️", tasks: ["Book venue", "Review contract", "Pay deposit"], completed: 3, total: 3 },
    {
      name: "Catering",
      emoji: "🍰",
      tasks: ["Choose caterer", "Menu tasting", "Final invoice"],
      completed: 2,
      total: 3,
    },
    {
      name: "Photography",
      emoji: "📸",
      tasks: ["Book photographer", "Engagement shoot", "Create shot list"],
      completed: 1,
      total: 3,
    },
    {
      name: "Florals",
      emoji: "💐",
      tasks: ["Choose florist", "Select arrangements", "Confirm delivery"],
      completed: 0,
      total: 3,
    },
    {
      name: "Music",
      emoji: "🎵",
      tasks: ["Book DJ/Band", "Create playlist", "Schedule sound check"],
      completed: 0,
      total: 3,
    },
    { name: "Attire", emoji: "👰", tasks: ["Choose dress", "Fittings", "Accessories"], completed: 1, total: 3 },
  ];

  const getDaysUntilWedding = () => {
    const today = new Date();
    const diffTime = weddingDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTimelineProgress = () => {
    const today = new Date();
    const totalTime = weddingDate - engagementDate;
    const elapsed = today - engagementDate;
    return Math.min(Math.max((elapsed / totalTime) * 100, 0), 100);
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    if (view === "landing") {
      setView("chat");
    }

    setMessages((prev) => [
      ...prev,
      { type: "user", text },
      {
        type: "bot",
        text: `Great question! Let me help you with "${text}". As your wedding planning assistant, I can guide you through each step of the process. What specific aspect would you like to explore first?`,
      },
    ]);
    setInputValue("");
  };

  const LandingView = () => (
    <div className="flex flex-col items-center justify-between h-full p-6 bg-gradient-to-b from-blue-50 via-purple-50 to-white">
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="text-center">
          <img src={logoUrl} alt="Bride Buddy Logo" className="w-64 h-64 mx-auto mb-6 drop-shadow-lg" />
        </div>
      </div>

      <div className="w-full max-w-md space-y-4">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <input
            type="text"
            placeholder="Ask me anything about wedding planning..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
            className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-400 text-gray-700"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-500 text-center mb-3">Try asking:</p>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="w-full bg-white text-purple-600 py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium border-2 border-purple-100 hover:border-purple-300"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const ChatView = () => (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-gradient-to-r from-purple-500 to-blue-400 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="Bride Buddy" className="w-10 h-10 rounded-full bg-white p-1" />
          <span className="text-white font-semibold text-sm">Bride Buddy</span>
        </div>
        <button
          onClick={() => setView("dashboard")}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
        >
          <Calendar className="text-white" size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm">Start a conversation with your wedding planning assistant!</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                msg.type === "user"
                  ? "bg-purple-500 text-white rounded-br-sm"
                  : "bg-white text-gray-800 shadow-md rounded-bl-sm"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-purple-400"
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            className="bg-purple-500 hover:bg-purple-600 p-3 rounded-full transition-all shadow-md"
          >
            <Send className="text-white" size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const DashboardView = () => {
    const daysUntil = getDaysUntilWedding();
    const progress = getTimelineProgress();

    return (
      <div className="h-full overflow-y-auto bg-gradient-to-b from-purple-50 to-blue-50">
        <div className="bg-gradient-to-r from-purple-500 to-blue-400 px-4 py-3 flex items-center justify-between shadow-md">
          <button
            onClick={() => setView("chat")}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <span className="text-white font-semibold">Dashboard</span>
          <div className="w-9"></div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-6xl mb-3">💍</div>
            <h2 className="text-4xl font-bold text-purple-600 mb-2">{daysUntil}</h2>
            <p className="text-gray-600 font-medium">days until "I Do"</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-purple-500" />
              Wedding Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Engagement</span>
                <span>Wedding Day</span>
              </div>
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-purple-500 to-blue-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-4">
                {categories.map((cat, idx) => (
                  <div key={idx} className="text-center">
                    <div className={`text-2xl ${cat.completed === cat.total ? "opacity-100" : "opacity-30"}`}>
                      {cat.emoji}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">To-Do List</h3>
            <div className="space-y-4">
              {categories.map((category, idx) => (
                <div key={idx} className="border-l-4 border-purple-300 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{category.emoji}</span>
                      <h4 className="font-semibold text-gray-800">{category.name}</h4>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {category.completed}/{category.total}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {category.tasks.map((task, taskIdx) => (
                      <div key={taskIdx} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={taskIdx < category.completed}
                          className="w-4 h-4 text-purple-500 rounded"
                          readOnly
                        />
                        <span className={taskIdx < category.completed ? "line-through text-gray-400" : "text-gray-700"}>
                          {task}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-white shadow-2xl">
      {view === "landing" && <LandingView />}
      {view === "chat" && <ChatView />}
      {view === "dashboard" && <DashboardView />}
    </div>
  );
};

export default BrideBuddyApp;
