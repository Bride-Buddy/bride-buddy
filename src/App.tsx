import React, { useState, useRef, useEffect } from "react";
import { Send, LayoutDashboard, CheckSquare, ArrowLeft, DollarSign } from "lucide-react";
import logo from "@/assets/bride-buddy-logo-ring.png";

const BrideBuddyReturningUser = () => {
  const [view, setView] = useState("chat"); // chat, dashboard, or planner
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [userName] = useState("Sarah"); // This would come from user database
  const [weddingDate] = useState(new Date("2026-06-20"));
  const [engagementDate] = useState(new Date("2025-01-15"));
  const [lastTopic] = useState("bridesmaid dresses"); // Last thing they were discussing
  const [budget] = useState(50000); // Total budget
  const [spent] = useState(28450); // Total spent so far

  const suggestedPrompts = [
    { text: "Show me my progress", action: "dashboard" },
    { text: "Pick up where we left off", action: "continue" },
    { text: "Just need to vent", action: "vent" },
    { text: "To-do today", action: "todo" },
  ];

  // Unified planner data - combines budget, tasks, and vendor info
  const plannerCategories = [
    {
      category: "Venue",
      emoji: "🏛️",
      vendor: "The Grand Ballroom",
      phone: "(555) 234-5678",
      totalCost: 12000,
      depositPaid: 5000,
      totalPaid: 12000,
      confirmed: true,
      tasks: [
        { task: "Book venue", completed: true },
        { task: "Review contract", completed: true },
        { task: "Pay deposit", completed: true },
        { task: "Confirm final details", completed: true },
      ],
    },
    {
      category: "Catering",
      emoji: "🍰",
      vendor: "Delicious Catering Co",
      phone: "(555) 345-6789",
      totalCost: 12000,
      depositPaid: 2000,
      totalPaid: 8500,
      confirmed: false,
      tasks: [
        { task: "Choose caterer", completed: true },
        { task: "Menu tasting", completed: true },
        { task: "Send final guest count (142 guests • 73 chicken, 42 fish, 10 beef, 17 vegetarian)", completed: false },
        { task: "Final invoice payment", completed: false },
      ],
    },
    {
      category: "Photography",
      emoji: "📸",
      vendor: "Picture Perfect Photography",
      phone: "(555) 456-7890",
      totalCost: 4500,
      depositPaid: 1000,
      totalPaid: 3500,
      confirmed: false,
      tasks: [
        { task: "Book photographer", completed: true },
        { task: "Engagement shoot", completed: false },
        { task: "Create shot list", completed: false },
        { task: "Confirm day-of timeline", completed: false },
      ],
    },
    {
      category: "Attire",
      emoji: "👰",
      vendor: "Bella Bridal Boutique",
      phone: "(555) 567-8901",
      totalCost: 5500,
      depositPaid: 1500,
      totalPaid: 4450,
      confirmed: false,
      tasks: [
        { task: "Choose dress", completed: true },
        { task: "First fitting", completed: true },
        { task: "Final fitting", completed: false },
        { task: "Pick up dress", completed: false },
      ],
    },
    {
      category: "Florals",
      emoji: "💐",
      vendor: "Blooms & Petals",
      phone: "(555) 678-9012",
      totalCost: 3500,
      depositPaid: 0,
      totalPaid: 0,
      confirmed: false,
      tasks: [
        { task: "Choose florist", completed: false },
        { task: "Select arrangements", completed: false },
        { task: "Confirm delivery details", completed: false },
      ],
    },
    {
      category: "Music",
      emoji: "🎵",
      vendor: "DJ Mike's Entertainment",
      phone: "(555) 789-0123",
      totalCost: 2000,
      depositPaid: 0,
      totalPaid: 0,
      confirmed: false,
      tasks: [
        { task: "Book DJ/Band", completed: false },
        { task: "Create playlist", completed: false },
        { task: "Schedule sound check", completed: false },
      ],
    },
  ];

  // Wedding vibe emojis - generated during onboarding based on their answers
  const [weddingVibeEmojis] = useState(["💕", "🌸", "🌿", "🏡", "🦋"]);

  const getDaysUntilWedding = () => {
    const today = new Date();
    const diffTime = weddingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTimelineProgress = () => {
    const today = new Date();
    const totalTime = weddingDate.getTime() - engagementDate.getTime();
    const elapsed = today.getTime() - engagementDate.getTime();
    return Math.min(Math.max((elapsed / totalTime) * 100, 0), 100);
  };

  const getTodaysFocus = () => {
    const incompleteTasks = [];
    plannerCategories.forEach((cat) => {
      cat.tasks.forEach((task) => {
        if (!task.completed) {
          incompleteTasks.push({
            task: task.task,
            emoji: cat.emoji,
            vendor: cat.vendor,
            phone: cat.phone,
          });
        }
      });
    });
    return incompleteTasks.slice(0, 4);
  };

  const getTimelineMarkers = () => {
    const today = new Date();
    const totalTime = weddingDate.getTime() - engagementDate.getTime();
    const totalDays = Math.ceil(totalTime / (1000 * 60 * 60 * 24));
    const elapsed = today.getTime() - engagementDate.getTime();
    const currentDay = Math.ceil(elapsed / (1000 * 60 * 60 * 24));

    const markers = [];
    const categoryCompletionDays = {
      Venue: 45,
      Catering: 120,
      Photography: null,
      Florals: null,
      Music: null,
      Attire: 90,
    };

    for (let day = 0; day <= totalDays; day++) {
      let marker = {
        day: day,
        type: "empty",
        emoji: null,
        position: (day / totalDays) * 100,
      };

      Object.entries(categoryCompletionDays).forEach(([catName, completionDay]) => {
        if (completionDay === day) {
          const category = plannerCategories.find((c) => c.category === catName);
          if (category && category.tasks.every((t) => t.completed)) {
            marker.type = "category";
            marker.emoji = category.emoji;
          }
        }
      });

      if (day === currentDay) {
        marker.type = "car";
        marker.emoji = "🚗";
      }

      markers.push(marker);
    }

    return markers;
  };

  const handlePromptClick = (prompt) => {
    if (prompt.action === "dashboard") {
      setView("dashboard");
      return;
    }

    let botResponse = "";

    if (prompt.action === "continue") {
      botResponse = `Let's keep our progress going! Do you want to continue discussing *${lastTopic}* or is there something else on your mind?`;
    } else if (prompt.action === "vent") {
      botResponse = "That's exactly what I'm here for! Let it out, you can't hurt my feelings 😌";
    } else if (prompt.action === "todo") {
      botResponse =
        "Here's what I have lined up for you today! 📋\n\n💐 Call florist\nBlooms & Petals • (555) 678-9012\n\n🍰 Send final guest count\n142 guests • 73 chicken, 42 fish, 10 beef, 17 vegetarian\n\n🍽️ Confirm rehearsal dinner\nOlive Garden • (555) 456-7890 • June 19, 6:30pm\n\nI'm here if you need help with any of these!";
    }

    setMessages([
      { type: "user", text: prompt.text },
      { type: "bot", text: botResponse },
    ]);
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    const userMessage = { type: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    setTimeout(() => {
      const botResponse = `I hear you! Let me help you with that. Tell me more about what you're thinking regarding "${text}"?`;
      setMessages((prev) => [...prev, { type: "bot", text: botResponse }]);
    }, 1000);
  };

  const ChatView = () => {
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, [messages.length]);

    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-gradient-to-r from-purple-300 to-blue-300 px-4 py-3 flex items-center justify-between shadow-md">
          <button onClick={() => setView("chat")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Bride Buddy" className="w-32 h-32 object-contain cursor-pointer" />
          </button>
          <button
            onClick={() => setView("dashboard")}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
          >
            <LayoutDashboard className="text-white" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6 px-6">
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-bold text-purple-400" style={{ fontFamily: "Quicksand, sans-serif" }}>
                  Welcome back, {userName}! 💕
                </h2>
              </div>

              <div className="w-full max-w-sm space-y-4">
                <div className="bg-white rounded-2xl shadow-lg p-4">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Tell me where you want to start today, or click a suggested prompt below"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-300 text-gray-700"
                    autoFocus
                  />
                </div>

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
                ref={inputRef}
                type="text"
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-purple-300"
                autoFocus
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

  const DashboardView = () => {
    const daysUntil = getDaysUntilWedding();
    const progress = getTimelineProgress();
    const todaysTasks = getTodaysFocus();

    return (
      <div className="h-full overflow-y-auto bg-gradient-to-b from-purple-100 to-blue-100">
        <div className="bg-gradient-to-r from-purple-300 to-blue-300 px-4 py-3 flex items-center justify-center shadow-md">
          <button onClick={() => setView("chat")} className="hover:opacity-80 transition-opacity">
            <img src={logo} alt="Bride Buddy" className="w-24 h-24 object-contain cursor-pointer" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="flex justify-center gap-2 mb-4">
              {weddingVibeEmojis.map((emoji, idx) => (
                <span key={idx} className="text-3xl">
                  {emoji}
                </span>
              ))}
            </div>
            <h2 className="text-4xl font-bold text-purple-400 mb-2">{daysUntil}</h2>
            <p className="text-gray-600 font-medium">days until "I Do"</p>
          </div>

          <div
            className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all"
            onClick={() => setView("planner")}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-purple-400" />
              Budget Overview
            </h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">${spent.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mt-1">of ${budget.toLocaleString()} spent</div>
              </div>

              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-purple-300 to-blue-300 transition-all duration-500"
                  style={{ width: `${(spent / budget) * 100}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>${(budget - spent).toLocaleString()} remaining</span>
                <span>{Math.round((spent / budget) * 100)}% used</span>
              </div>

              <div className="text-xs text-center text-purple-400 font-medium mt-4">
                Click to view full wedding planner →
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <LayoutDashboard size={20} className="text-purple-400" />
              Wedding Timeline
            </h3>
            <div className="space-y-4">
              <div className="relative h-16 bg-gray-100 rounded-lg overflow-visible px-4">
                <div
                  className="absolute top-1/2 left-0 w-full h-1 bg-gray-200"
                  style={{ transform: "translateY(-50%)" }}
                ></div>

                <div
                  className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-300 to-blue-300 transition-all duration-500"
                  style={{ width: `${progress}%`, transform: "translateY(-50%)" }}
                ></div>

                <div
                  className="absolute top-1/2 text-2xl z-10"
                  style={{
                    left: "0%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  💍
                </div>

                <div
                  className="absolute top-1/2 text-2xl z-10"
                  style={{
                    left: "100%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  💕
                </div>

                <div className="absolute inset-0">
                  {getTimelineMarkers().map((marker, idx) => {
                    if (marker.type === "empty" && idx % 30 !== 0) return null;

                    return (
                      <div
                        key={idx}
                        className="absolute top-1/2 z-20"
                        style={{
                          left: `${marker.position}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        {marker.type === "car" ? (
                          <div className="text-2xl" style={{ transform: "scaleX(-1)" }}>
                            🚗
                          </div>
                        ) : marker.type === "category" ? (
                          <div className="text-xl">{marker.emoji}</div>
                        ) : marker.position > 0 && marker.position < 100 ? (
                          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckSquare size={20} className="text-purple-400" />
              Your Focus Today
            </h3>
            <div className="space-y-3">
              {todaysTasks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 mb-1">{item.task}</p>
                      <p className="text-xs text-gray-500">
                        {item.vendor} • {item.phone}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setView("planner")}
              className="w-full mt-4 text-sm text-purple-400 hover:text-purple-500 font-medium transition-colors"
            >
              View full wedding planner →
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PlannerView = () => {
    return (
      <div className="h-full overflow-y-auto bg-gradient-to-b from-purple-100 to-blue-100">
        <div className="bg-gradient-to-r from-purple-300 to-blue-300 px-4 py-3 flex items-center justify-between shadow-md">
          <button
            onClick={() => setView("dashboard")}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <button onClick={() => setView("chat")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Bride Buddy" className="w-32 h-32 object-contain cursor-pointer" />
            <span className="text-white font-semibold">Wedding Planner</span>
          </button>
          <div className="w-9"></div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-purple-400" />
              Budget Summary
            </h3>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-purple-400">${spent.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">of ${budget.toLocaleString()} spent</div>
            </div>
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-3">
              <div
                className="absolute h-full bg-gradient-to-r from-purple-300 to-blue-300 transition-all duration-500"
                style={{ width: `${(spent / budget) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>${(budget - spent).toLocaleString()} remaining</span>
              <span>{Math.round((spent / budget) * 100)}% used</span>
            </div>
          </div>

          {plannerCategories.map((category, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{category.emoji}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{category.category}</h3>
                  <p className="text-sm text-gray-600">{category.vendor}</p>
                  <p className="text-xs text-gray-500">{category.phone}</p>
                </div>
                <input
                  type="checkbox"
                  checked={category.confirmed}
                  className="w-6 h-6 text-purple-400 rounded"
                  readOnly
                  title="Confirmed 1 month prior"
                />
              </div>

              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Paid / Total Cost</span>
                  <span className="font-bold text-purple-400">
                    ${category.totalPaid.toLocaleString()} / ${category.totalCost.toLocaleString()}
                  </span>
                </div>
                {category.depositPaid > 0 && (
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                    <span>Deposit paid</span>
                    <span>${category.depositPaid.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {category.tasks.map((task, taskIdx) => (
                  <div key={taskIdx} className="flex items-start gap-3 p-2">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      className="w-5 h-5 text-purple-400 rounded mt-0.5"
                      readOnly
                    />
                    <p className={`text-sm flex-1 ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                      {task.task}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-white shadow-2xl">
      {view === "chat" && <ChatView />}
      {view === "dashboard" && <DashboardView />}
      {view === "planner" && <PlannerView />}
    </div>
  );
};

export default BrideBuddyReturningUser;
