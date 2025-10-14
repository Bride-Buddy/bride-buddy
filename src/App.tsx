import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Toaster } from "@/components/ui/toaster";

import Chat from "./pages/chat";
import Dashboard from "./pages/Dashboard";
import Planner from "./pages/Planner";
import Auth from "./pages/Auth";
import AuthRedirect from "./pages/AuthRedirect";
import OnboardingChat from "./pages/OnboardingChat";
import { TrialExpirationModal, PricingModal } from "./components/Modals";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [plannerCategories, setPlannerCategories] = useState<any[]>([]);

  const navigate = useNavigate();

  // 🔐 Handle authentication state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 📋 Fetch user profile & timeline data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: timelineData } = await supabase
        .from("timeline")
        .select("engagement_date, wedding_date")
        .eq("user_id", userId)
        .single();

      // 👰 Determine if onboarding is required
      if (!timelineData?.engagement_date || !timelineData?.wedding_date) {
        setNeedsOnboarding(true);
      } else {
        setNeedsOnboarding(false);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🕒 Trial modal logic
  useEffect(() => {
    if (profile?.subscription_tier === "trial" && profile?.trial_start_date) {
      const trialStart = new Date(profile.trial_start_date);
      const today = new Date();
      const trialEnd = new Date(trialStart);
      trialEnd.setDate(trialEnd.getDate() + 7);

      const diffTime = trialEnd.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 1 && daysRemaining > 0) {
        setShowTrialModal(true);
      }
    }
  }, [profile]);

  const getDaysRemainingInTrial = () => {
    if (!profile?.trial_start_date) return 0;
    const today = new Date();
    const trialEnd = new Date(profile.trial_start_date);
    trialEnd.setDate(trialEnd.getDate() + 7);
    const diffTime = trialEnd.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTrialEndDate = () => {
    if (!profile?.trial_start_date) return "";
    const trialEnd = new Date(profile.trial_start_date);
    trialEnd.setDate(trialEnd.getDate() + 7);
    return trialEnd.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  // 🌈 MAIN APP ROUTES
  return (
    <>
      <Toaster />

      {/* 💌 Modals */}
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
          }}
          onClose={() => setShowTrialModal(false)}
        />
      )}

      {showPricingModal && (
        <PricingModal
          isEarlyBird={true}
          onMonthlySelect={() => {
            setShowPricingModal(false);
          }}
          onUntilIDoSelect={() => {
            setShowPricingModal(false);
          }}
          onClose={() => setShowPricingModal(false)}
        />
      )}

      {/* 🧭 ROUTER */}
      <Routes>
        {/* Login Page */}
        <Route
          path="/auth"
          element={!session ? <Auth /> : <Navigate to={needsOnboarding ? "/OnboardingChat" : "/chat"} />}
        />

        {/* Post-login redirect handler */}
        <Route path="/AuthRedirect" element={<AuthRedirect />} />

        {/* Onboarding for new users */}
        <Route
          path="/OnboardingChat"
          element={
            session && profile ? (
              <OnboardingChat userId={session.user.id} userName={profile.full_name || ""} />
            ) : (
              <Navigate to="/Auth" />
            )
          }
        />

        {/* Main chat interface */}
        <Route
          path="/chat"
          element={
            session ? (
              <Chat
                userName={profile?.full_name || ""}
                userTier={profile?.subscription_tier || "free"}
                onNavigate={(view) => navigate(`/${view}`)} // ✅ React Router navigation
              />
            ) : (
              <Navigate to="/Auth" />
            )
          }
        />

        {/* Dashboard */}
        <Route
          path="/Dashboard"
          element={
            session ? (
              <Dashboard
                userName={profile?.full_name || ""}
                weddingDate={profile?.wedding_date ? new Date(profile.wedding_date) : new Date()}
                engagementDate={new Date()}
                budget={0}
                spent={0}
                weddingVibeEmojis={[]}
                plannerCategories={[]}
                onNavigate={(view) => navigate(`/${view}`)}
              />
            ) : (
              <Navigate to="/Auth" />
            )
          }
        />

        {/* Planner */}
        <Route
          path="/planner"
          element={
            session ? (
              <Planner budget={0} spent={0} plannerCategories={[]} onNavigate={(view) => navigate(`/${view}`)} />
            ) : (
              <Navigate to="/Auth" />
            )
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={<Navigate to={session ? (needsOnboarding ? "/OnboardingChat" : "/chat") : "/Auth"} />}
        />
      </Routes>
    </>
  );
}

export default App;
