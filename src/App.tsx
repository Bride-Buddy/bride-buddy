import React, { useState, useEffect } from "react";
import Chat from "./pages/chat";
import Dashboard from "./pages/BrideDashboardPage";
import Planner from "./pages/Planner";
import { TrialExpirationModal, PricingModal } from "./components/Modals";
import NewUserSignup from "./pages/NewUserSignup";

function App() {
  // App state management
  const [userStatus, setUserStatus] = useState<"new-user" | "returning-user">("returning-user");
  const [view, setView] = useState<"chat" | "dashboard" | "planner">("chat");
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // User data - in production, this comes from your database
  const [userName] = useState("Sarah");
  const [userTier] = useState<"vip-trial" | "vip-paid" | "free">("vip-trial");
  const [trialStartDate] = useState(new Date("2025-10-07")); // 6 days ago for demo
  const [weddingDate] = useState(new Date("2026-06-20"));
  const [engagementDate] = useState(new Date("2025-01-15"));
  const [budget] = useState(50000);
  const [spent] = useState(28450);
  const [weddingVibeEmojis] = useState(["💕", "🌸", "🌿", "🏡", "🦋"]);

  // Planner categories data
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

  // Helper functions for trial management
  const getDaysRemainingInTrial = () => {
    const today = new Date();
    const trialEnd = new Date(trialStartDate);
    trialEnd.setDate(trialEnd.getDate() + 7);
    const diffTime = trialEnd.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTrialEndDate = () => {
    const trialEnd = new Date(trialStartDate);
    trialEnd.setDate(trialEnd.getDate() + 7);
    return trialEnd.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  };

  // Check if should show trial modal (day 6 or 7)
  useEffect(() => {
    if (userStatus === "returning-user" && userTier === "vip-trial") {
      const daysRemaining = getDaysRemainingInTrial();
      if (daysRemaining <= 1 && daysRemaining > 0) {
        setShowTrialModal(true);
      }
    }
  }, [userStatus, userTier]);

  // NEW USER FLOW
  if (userStatus === "new-user") {
    return (
      <NewUserSignup
        onSignupComplete={() => {
          // After signup, redirect to onboarding or main app
          // In production, this would create user in database
          setUserStatus("returning-user");
          setView("chat");
        }}
        onNavigateToSignIn={() => {
          setUserStatus("returning-user");
        }}
      />
    );
  }

  // RETURNING USER FLOW
  return (
    <>
      {/* Modals */}
      {showTrialModal && (
        <TrialExpirationModal
          daysRemaining={getDaysRemainingInTrial()}
          trialEndDate={getTrialEndDate()}
          onUpgradeClick={() => {
            setShowTrialModal(false);
            setShowPricingModal(true);
          }}
          onBasicClick={() => {
            setShowTrialModal(false);
            // In production, downgrade user to free tier
            console.log("User chose basic plan");
          }}
          onClose={() => setShowTrialModal(false)}
        />
      )}

      {showPricingModal && (
        <PricingModal
          isEarlyBird={true}
          onMonthlySelect={() => {
            // Connect to Stripe monthly plan
            console.log("Monthly plan selected");
            setShowPricingModal(false);
          }}
          onUntilIDoSelect={() => {
            // Connect to Stripe one-time plan
            console.log("Until I Do plan selected");
            setShowPricingModal(false);
          }}
          onClose={() => setShowPricingModal(false)}
        />
      )}

      {/* Main Views */}
      {view === "chat" && (
        <Chat userName={userName} userTier={userTier} onNavigate={(newView) => setView(newView as any)} />
      )}

      {view === "dashboard" && (
        <Dashboard
          userName={userName}
          weddingDate={weddingDate}
          engagementDate={engagementDate}
          budget={budget}
          spent={spent}
          weddingVibeEmojis={weddingVibeEmojis}
          plannerCategories={plannerCategories}
          onNavigate={(newView) => setView(newView as any)}
        />
      )}

      {view === "planner" && (
        <Planner
          budget={budget}
          spent={spent}
          plannerCategories={plannerCategories}
          onNavigate={(newView) => setView(newView as any)}
        />
      )}
    </>
  );
}

export default App;
