import React, { useState } from "react";
import { Send, LayoutDashboard, CheckSquare, ArrowLeft, DollarSign, Mail, Sparkles } from "lucide-react";
import logo from "@/assets/bride-buddy-logo-new.png";

const BrideBuddyComplete = () => {
  // App state: 'new-user', 'verification-sent', 'onboarding', 'returning-user'
  const [appState, setAppState] = useState("new-user");
  const [view, setView] = useState("chat"); // For returning users: chat, dashboard, planner
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // User data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userName] = useState("Sarah"); // Would be set after authentication
  const [userTier] = useState("vip-trial"); // 'vip-trial', 'vip-paid', 'free'
  const [trialStartDate] = useState(new Date("2025-10-07")); // Mock: 6 days ago
  const [weddingDate] = useState(new Date("2026-06-20"));
  const [engagementDate] = useState(new Date("2025-01-15"));
  const [lastTopic] = useState("bridesmaid dresses");
  const [budget] = useState(50000);
  const [spent] = useState(28450);
  const [weddingVibeEmojis] = useState(["💕", "🌸", "🌿", "🏡", "🦋"]);

  const logoUrl = logo;

  const suggestedPrompts = [
    { text: "Show me my progress", action: "dashboard" },
    { text: "Pick up where we left off", action: "continue" },
    { text: "Just need to vent", action: "vent" },
    { text: "To-do today", action: "todo" },
  ];

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

  // Helper functions
  const getDaysRemainingInTrial = () => {
    const today = new Date();
    const trialEnd = new Date(trialStartDate);
    trialEnd.setDate(trialEnd.getDate() + 7);
    const diffTime = trialEnd.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTrialEndDate = () => {
    const trialEnd = new Date(trialStartDate);
    trialEnd.setDate(trialEnd.getDate() + 7);
    return trialEnd.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  };

  const isVIPAccess = () => {
    return userTier === "vip-trial" || userTier === "vip-paid";
  };

  const getDaysUntilWedding = () => {
    const today = new Date();
    const diffTime = weddingDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

  // NEW USER FLOW
  const handleSendVerification = () => {
    if (!name.trim() || !email.trim()) {
      alert("Please enter your name and email");
      return;
    }
    setAppState("verification-sent");
    // Simulate email verification
    setTimeout(() => {
      setAppState("onboarding");
    }, 3000);
  };

  const handleStartPlanning = () => {
    const welcomeMessage = `Hi ${name}! Congratulations, I'm so excited to help you plan this special day. Let's start building your dream Wedding Dashboard from scratch. Let me ask you a few questions first: when did you get engaged? 💍`;

    setMessages([
      { type: "user", text: "Let's start planning my wedding!" },
      { type: "bot", text: welcomeMessage },
    ]);
  };

  const handleOnboardingMessage = (text) => {
    if (!text.trim()) return;

    const userMessage = { type: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    setTimeout(() => {
      let botResponse = "";

      if (messages.length === 2) {
        botResponse =
          "Tell me about your relationship! Who is it? How did you meet? How long have you been together? Tell me everything! 💕";
      } else if (messages.length === 4) {
        botResponse = "That's so beautiful! 🥰 Do you have a wedding date set yet? If so, what's the date?";
      } else if (messages.length === 6) {
        botResponse =
          "Perfect! Have you booked a venue yet? If yes, which one? If not, do you have any venues in mind?";
      } else if (messages.length === 8) {
        botResponse =
          "Great! What's your vision for the wedding? (For example: elegant ballroom, rustic outdoor, beachside, intimate garden, modern chic, etc.)";
      } else if (messages.length === 10) {
        botResponse =
          "Love it! One more important question: Do you have a set budget for your wedding? If so, what's your total budget? 💰";
      } else if (messages.length === 12) {
        botResponse =
          "Perfect! Based on everything you've told me, I'm creating your personalized wedding vibe emojis that will appear on your dashboard. These capture the essence of your special day and you can always change them if your vision evolves! ✨";
      } else {
        botResponse =
          "Wonderful! I'm building your personalized dashboard now with all this information. You can always update these details later. Ready to see your dashboard? 📊";
        setTimeout(() => {
          setAppState("returning-user");
          setView("dashboard");
        }, 2000);
      }

      setMessages((prev) => [...prev, { type: "bot", text: botResponse }]);
    }, 1000);
  };

  // RETURNING USER FLOW
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

  const handleReturningMessage = (text) => {
    if (!text.trim()) return;

    const userMessage = { type: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    setTimeout(() => {
      const botResponse = `I hear you! Let me help you with that. Tell me more about what you're thinking regarding "${text}"?`;
      setMessages((prev) => [...prev, { type: "bot", text: botResponse }]);
    }, 1000);
  };

  // VIEWS

  // Trial Expiration Modal
  const TrialExpirationModal = () => {
    const daysRemaining = getDaysRemainingInTrial();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">⏰</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your VIP Trial is Ending</h2>
            <p className="text-gray-600">
              Your trial ends in{" "}
              <span className="font-bold text-purple-400">
                {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
              </span>
            </p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-700 text-center">
              <span className="font-semibold">Upgrade now to keep the progress going!</span>
            </p>
            <p className="text-sm text-gray-600 text-center mt-2">
              Not interested? Downgrade to Basic Chat to continue access to wedding planning chatbot.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setShowTrialModal(false);
                setShowPricingModal(true);
              }}
              className="w-full bg-gradient-to-r from-purple-400 to-blue-400 text-white py-5 px-6 rounded-xl font-bold hover:shadow-lg transition-all text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg mb-1">Upgrade to Bride Buddy VIP</div>
                  <div className="text-sm font-normal opacity-90">Unlimited chat • Dashboard • Finance tracker</div>
                </div>
                <div className="text-xl">💎</div>
              </div>
            </button>

            <button
              onClick={() => setShowTrialModal(false)}
              className="w-full bg-gray-100 text-gray-700 py-5 px-6 rounded-xl font-bold hover:bg-gray-200 transition-all text-left border-2 border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg mb-1">Bride Buddy Basic</div>
                  <div className="text-sm font-normal text-gray-600">20 messages/day</div>
                </div>
                <div className="text-xl">💬</div>
              </div>
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Your account will downgrade automatically on {getTrialEndDate()} at 00:00
          </p>
        </div>
      </div>
    );
  };

  // Pricing Selection Modal
  const PricingModal = () => {
    const isEarlyBird = true; // Mock: would check if user is in first 100

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <button
            onClick={() => setShowPricingModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>

          <div className="text-center mb-6">
            <div className="text-5xl mb-4">💎</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Plan</h2>
            <p className="text-gray-600 text-sm">Unlock your complete wedding planning assistant</p>
          </div>

          {isEarlyBird && (
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-3 mb-6 text-center">
              <p className="text-sm font-bold text-orange-700">🎉 Early Adopters Special - First 100 Customers Only!</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => {
                // Will connect to Stripe via Lovable
                setShowPricingModal(false);
              }}
              className="w-full bg-gradient-to-r from-purple-400 to-blue-400 text-white py-6 px-6 rounded-xl hover:shadow-lg transition-all text-left border-4 border-purple-300"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-xl font-bold">"Until I Do" Plan</div>
                <div className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full font-semibold">BEST VALUE</div>
              </div>
              <div className="text-3xl font-bold mb-2">
                {isEarlyBird ? (
                  <>
                    <span className="line-through text-white text-opacity-60 text-xl mr-2">$299</span>
                    $249
                  </>
                ) : (
                  "$299"
                )}
              </div>
              <div className="text-sm opacity-90">One-time payment • Access until your wedding day</div>
            </button>

            <button
              onClick={() => {
                // Will connect to Stripe via Lovable
                setShowPricingModal(false);
              }}
              className="w-full bg-white text-gray-700 py-6 px-6 rounded-xl hover:shadow-lg transition-all text-left border-2 border-gray-200"
            >
              <div className="text-xl font-bold mb-2">Monthly Plan</div>
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {isEarlyBird ? (
                  <>
                    <span className="line-through text-gray-400 text-xl mr-2">$29.99</span>
                    $19.99
                  </>
                ) : (
                  "$29.99"
                )}
                <span className="text-base font-normal text-gray-600">/month</span>
              </div>
              <div className="text-sm text-gray-600">Billed monthly • Cancel anytime</div>
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            All plans include: Unlimited chat • Dashboard • Budget tracker • Timeline • Task manager
          </p>
        </div>
      </div>
    );
  };

  // Check if should show trial modal (day 6 or 7)
  React.useEffect(() => {
    if (appState === "returning-user" && userTier === "vip-trial") {
      const daysRemaining = getDaysRemainingInTrial();
      if (daysRemaining <= 1 && daysRemaining > 0) {
        setShowTrialModal(true);
      }
    }
  }, [appState]);

  if (appState === "new-user") {
    return (
      <div className="w-full h-screen max-w-md mx-auto bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-6">
        <div className="flex-1 flex items-center justify-center">
          <img src={logoUrl} alt="Bride Buddy Logo" className="w-80 h-80 drop-shadow-2xl" />
        </div>

        <div className="w-full space-y-4 pb-8">
          <h2
            className="text-2xl font-bold text-center text-purple-400 mb-2"
            style={{ fontFamily: "Quicksand, sans-serif" }}
          >
            Create Your Account
          </h2>
          <p className="text-center text-gray-600 text-sm mb-6">
            Unlock your wedding planning assistant — 7 days free ✨
          </p>

          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-300 text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-300 text-gray-700"
              />
            </div>

            <button
              onClick={handleSendVerification}
              className="w-full bg-gradient-to-r from-purple-300 to-blue-300 text-white py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-base font-bold flex items-center justify-center gap-2"
            >
              <Send size={20} />
              Send Verification Link
            </button>
          </div>

          <p className="text-xs text-center text-gray-500 px-4">
            We'll send you a magic link to verify your email and get started! ✨
          </p>

          <button
            onClick={() => setAppState("returning-user")}
            className="text-xs text-center text-gray-400 hover:text-purple-400 transition-colors w-full"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    );
  }

  if (appState === "verification-sent") {
    return (
      <div className="w-full h-screen max-w-md mx-auto bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-purple-200 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Mail size={48} className="text-purple-400" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-purple-400" style={{ fontFamily: "Quicksand, sans-serif" }}>
              Check Your Email! 📧
            </h2>
            <p className="text-gray-600 px-6">
              We sent a verification link to
              <br />
              <span className="font-semibold text-purple-400">{email}</span>
            </p>
            <p className="text-sm text-gray-500 px-6">
              Click the link in the email to verify your account and start planning your dream wedding! 💍
            </p>
          </div>

          <div className="pt-6">
            <Sparkles className="text-purple-300 mx-auto animate-bounce" size={32} />
          </div>
        </div>
      </div>
    );
  }

  if (appState === "onboarding") {
    return (
      <div className="w-full h-screen max-w-md mx-auto bg-white shadow-2xl flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-blue-100 via-purple-100 to-pink-50">
            <div className="flex-1 flex items-center justify-center">
              <img src={logoUrl} alt="Bride Buddy Logo" className="w-64 h-64 drop-shadow-lg" />
            </div>

            <div className="w-full space-y-4">
              <button
                onClick={handleStartPlanning}
                className="w-full bg-gradient-to-r from-purple-300 to-blue-300 text-white py-5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 text-lg font-bold"
              >
                Let's start planning your wedding! 💍
              </button>

              <p className="text-sm text-center text-gray-500">
                I'll ask you a few questions to personalize your experience
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-purple-300 to-blue-300 px-4 py-3 flex items-center shadow-md">
              <img src={logoUrl} alt="Bride Buddy" className="w-10 h-10 rounded-full bg-white p-1" />
              <span className="text-white font-semibold text-sm ml-3">Bride Buddy</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
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
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your answer..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleOnboardingMessage(inputValue)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-purple-300"
                />
                <button
                  onClick={() => handleOnboardingMessage(inputValue)}
                  className="bg-purple-300 hover:bg-purple-400 p-3 rounded-full transition-all shadow-md"
                >
                  <Send className="text-white" size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // RETURNING USER - CHAT VIEW
  if (appState === "returning-user" && view === "chat") {
    const isFreeUser = userTier === "free";

    return (
      <div className="w-full h-screen max-w-md mx-auto bg-white shadow-2xl flex flex-col">
        {showTrialModal && <TrialExpirationModal />}
        {showPricingModal && <PricingModal />}

        <div className="bg-gradient-to-r from-purple-300 to-blue-300 px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Bride Buddy" className="w-10 h-10 rounded-full bg-white p-1" />
            <span className="text-white font-semibold text-sm">Bride Buddy</span>
          </div>
          {isVIPAccess() && (
            <button
              onClick={() => setView("dashboard")}
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
                    onKeyPress={(e) => e.key === "Enter" && handleReturningMessage(inputValue)}
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
                onKeyPress={(e) => e.key === "Enter" && handleReturningMessage(inputValue)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-purple-300"
              />
              <button
                onClick={() => handleReturningMessage(inputValue)}
                className="bg-purple-300 hover:bg-purple-400 p-3 rounded-full transition-all shadow-md"
              >
                <Send className="text-white" size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // RETURNING USER - DASHBOARD VIEW
  if (appState === "returning-user" && view === "dashboard") {
    const daysUntil = getDaysUntilWedding();
    const progress = getTimelineProgress();
    const todaysTasks = getTodaysFocus();

    return (
      <div className="w-full h-screen max-w-md mx-auto bg-white shadow-2xl">
        <div className="h-full overflow-y-auto bg-gradient-to-b from-purple-100 to-blue-100">
          <div className="bg-gradient-to-r from-purple-300 to-blue-300 px-4 py-3 flex items-center justify-between shadow-md">
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
      </div>
    );
  }

  // RETURNING USER - PLANNER VIEW
  if (appState === "returning-user" && view === "planner") {
    return (
      <div className="w-full h-screen max-w-md mx-auto bg-white shadow-2xl">
        <div className="h-full overflow-y-auto bg-gradient-to-b from-purple-100 to-blue-100">
          <div className="bg-gradient-to-r from-purple-300 to-blue-300 px-4 py-3 flex items-center justify-between shadow-md">
            <button
              onClick={() => setView("dashboard")}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <span className="text-white font-semibold">Wedding Planner</span>
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
                      <p
                        className={`text-sm flex-1 ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}
                      >
                        {task.task}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BrideBuddyComplete;
