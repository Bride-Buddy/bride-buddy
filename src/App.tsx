import React, { useState, useEffect } from "react";
import Chat from "./pages/chat";
import Dashboard from "./pages/dashboard";
import Planner from "./pages/planner";
import { TrialExpirationModal, PricingModal } from "./components/modals";
import NewUserSignup from "./pages/new-user-signup";

function App() {
  // App state management
  const [userStatus, setUserStatus] = useState<"new-user" | "returning-user">("returning-user");
  const [view, setView] = useState<"chat" | "dashboard" | "planner">("chat");
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // User data - fetch from Lovable database
  const [userName, setUserName] = useState("");
  const [userTier, setUserTier] = useState<"vip-trial" | "vip-paid" | "free">("free");
  const [trialStartDate, setTrialStartDate] = useState<Date | null>(null);
  const [weddingDate, setWeddingDate] = useState<Date | null>(null);
  const [engagementDate, setEngagementDate] = useState<Date | null>(null);
  const [budget, setBudget] = useState(0);
  const [spent, setSpent] = useState(0);
  const [weddingVibeEmojis, setWeddingVibeEmojis] = useState<string[]>([]);
  const [plannerCategories, setPlannerCategories] = useState<any[]>([]);

  // Helper functions for trial management
  const getDaysRemainingInTrial = () => {
    if (!trialStartDate) return 0;
    const today = new Date();
    const trialEnd = new Date(trialStartDate);
    trialEnd.setDate(trialEnd.getDate() + 7);
    const diffTime = trialEnd.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTrialEndDate = () => {
    if (!trialStartDate) return "";
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

  // TODO: Fetch user data from Lovable database on component mount
  useEffect(() => {
    // Fetch user data here
    // Example:
    // const userData = await fetchUserData();
    // setUserName(userData.name);
    // setUserTier(userData.tier);
    // setWeddingDate(new Date(userData.weddingDate));
    // etc...
  }, []);

  // NEW USER FLOW
  if (userStatus === "new-user") {
    return (
      <NewUserSignup
        onSignupComplete={() => {
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
            // Downgrade user to free tier in database
          }}
          onClose={() => setShowTrialModal(false)}
        />
      )}

      {showPricingModal && (
        <PricingModal
          isEarlyBird={true}
          onMonthlySelect={() => {
            // Connect to Stripe monthly plan
            setShowPricingModal(false);
          }}
          onUntilIDoSelect={() => {
            // Connect to Stripe one-time plan
            setShowPricingModal(false);
          }}
          onClose={() => setShowPricingModal(false)}
        />
      )}

      {/* Main Views */}
      {view === "chat" && weddingDate && (
        <Chat userName={userName} userTier={userTier} onNavigate={(newView) => setView(newView as any)} />
      )}

      {view === "dashboard" && weddingDate && engagementDate && (
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
