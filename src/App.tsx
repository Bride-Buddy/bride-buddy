// 🧪 TEST MODE - Change before deployment!
const IS_TESTING = true;

// Trial duration configuration
const TRIAL_DURATION_MS = IS_TESTING
  ? 30 * 1000 // 30 seconds for testing (easier to see all notifications)
  : 7 * 24 * 60 * 60 * 1000; // 7 days for production

const TRIAL_DURATION_DAYS = IS_TESTING ? 30 / (24 * 60 * 60) : 7; // For date calculationsimport React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Toaster } from "@/components/ui/toaster";

import Chat from "./pages/chat";
import Dashboard from "./pages/Dashboard";
import Planner from "./pages/Planner";
import Auth from "./pages/Auth";
import AuthRedirect from "./pages/AuthRedirect";
import EmailVerification from "./pages/EmailVerification";
import OnboardingChat from "./pages/OnboardingChat";
import { TrialExpirationModal, PricingModal } from "./components/Modals";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [plannerCategories, setPlannerCategories] = useState<any[]>([]);
  const [lastTrialNotification, setLastTrialNotification] = useState<string | null>(null);

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

  // 🕒 Enhanced trial modal logic with multi-stage warnings
  useEffect(() => {
    if (profile?.subscription_tier === "trial" && profile?.trial_start_date) {
      const trialStart = new Date(profile.trial_start_date);
      const now = new Date();
      const trialEnd = new Date(trialStart);
      trialEnd.setDate(trialEnd.getDate() + 7);

      const diffTime = trialEnd.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Check localStorage for last dismissal
      const lastDismissed = localStorage.getItem("trialModalDismissed");
      const today = now.toDateString();

      // Show modal at Day 5, 3, or 1 (unless dismissed today)
      if (
        (daysRemaining === 5 || daysRemaining === 3 || daysRemaining <= 1) &&
        daysRemaining > 0 &&
        lastDismissed !== today
      ) {
        setShowTrialModal(true);
      }

      // Show toast notifications
      if (lastTrialNotification !== today) {
        import("@/components/ui/use-toast").then(({ toast }) => {
          if (daysRemaining === 6) {
            toast({
              title: "🎉 Your trial has 6 days left!",
              description: "Enjoying Bride Buddy? Upgrade to VIP to keep all your data!",
            });
            setLastTrialNotification(today);
          } else if (daysRemaining === 5) {
            toast({
              title: "⏰ 5 days left in your VIP trial",
              description: "Don't forget to upgrade to save your progress!",
            });
            setLastTrialNotification(today);
          } else if (daysRemaining === 3) {
            toast({
              title: "⚠️ Only 3 days left!",
              description: "Upgrade now to save your wedding planning progress!",
              variant: "destructive",
            });
            setLastTrialNotification(today);
          } else if (daysRemaining === 1) {
            toast({
              title: "🚨 FINAL DAY of VIP trial!",
              description: "Upgrade today or lose all your data tomorrow!",
              variant: "destructive",
            });
            setLastTrialNotification(today);
          }
        });
      }
    }
  }, [profile, lastTrialNotification]);

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
  useEffect(() => {
    if (profile?.subscription_tier === "trial" && profile?.trial_start_date) {
      const trialStart = new Date(profile.trial_start_date);
      const now = new Date();

      // ✅ Use consistent duration
      const trialEnd = new Date(trialStart.getTime() + TRIAL_DURATION_MS);

      const diffTime = trialEnd.getTime() - now.getTime();

      // Calculate remaining time (for testing: seconds, for prod: days)
      const timeRemaining = IS_TESTING
        ? Math.ceil(diffTime / 1000) // seconds
        : Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days

      const lastDismissed = localStorage.getItem("trialModalDismissed");
      const today = now.toDateString();

      // Adjust thresholds for testing
      const warningThresholds = IS_TESTING
        ? [25, 20, 15, 10, 5] // seconds: show warnings at 25s, 20s, 15s, 10s, 5s remaining
        : [5, 3, 1]; // days: show warnings at 5, 3, 1 days remaining

      // Show modal at warning thresholds (unless dismissed today)
      if (warningThresholds.includes(timeRemaining) && timeRemaining > 0 && lastDismissed !== today) {
        setShowTrialModal(true);
      }

      // Show toast notifications
      if (lastTrialNotification !== today) {
        import("@/components/ui/use-toast").then(({ toast }) => {
          if (IS_TESTING) {
            // Testing toasts (in seconds)
            if (timeRemaining === 25) {
              toast({
                title: "🎉 Your trial has 25 seconds left!",
                description: "Enjoying Bride Buddy? Upgrade to VIP to keep all your data!",
              });
              setLastTrialNotification(today);
            } else if (timeRemaining === 15) {
              toast({
                title: "⏰ 15 seconds left in your VIP trial",
                description: "Don't forget to upgrade to save your progress!",
              });
              setLastTrialNotification(today);
            } else if (timeRemaining === 10) {
              toast({
                title: "⚠️ Only 10 seconds left!",
                description: "Upgrade now to save your wedding planning progress!",
                variant: "destructive",
              });
              setLastTrialNotification(today);
            } else if (timeRemaining === 5) {
              toast({
                title: "🚨 FINAL 5 SECONDS of VIP trial!",
                description: "Upgrade today or lose all your data!",
                variant: "destructive",
              });
              setLastTrialNotification(today);
            }
          } else {
            // Production toasts (in days)
            if (timeRemaining === 6) {
              toast({
                title: "🎉 Your trial has 6 days left!",
                description: "Enjoying Bride Buddy? Upgrade to VIP to keep all your data!",
              });
              setLastTrialNotification(today);
            } else if (timeRemaining === 5) {
              toast({
                title: "⏰ 5 days left in your VIP trial",
                description: "Don't forget to upgrade to save your progress!",
              });
              setLastTrialNotification(today);
            } else if (timeRemaining === 3) {
              toast({
                title: "⚠️ Only 3 days left!",
                description: "Upgrade now to save your wedding planning progress!",
                variant: "destructive",
              });
              setLastTrialNotification(today);
            } else if (timeRemaining === 1) {
              toast({
                title: "🚨 FINAL DAY of VIP trial!",
                description: "Upgrade today or lose all your data tomorrow!",
                variant: "destructive",
              });
              setLastTrialNotification(today);
            }
          }
        });
      }
    }
  }, [profile, lastTrialNotification]);
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
          onBasicClick={async () => {
            try {
              // Downgrade to free tier
              const { error } = await supabase
                .from("profiles")
                .update({ subscription_tier: "free" })
                .eq("user_id", session?.user?.id);

              if (error) throw error;

              setShowTrialModal(false);

              // Show confirmation
              import("@/components/ui/use-toast").then(({ toast }) => {
                toast({
                  title: "Downgraded to Basic",
                  description: "You now have 20 messages per day. Your data has been cleared.",
                });
              });

              // Refresh profile
              if (session?.user?.id) {
                fetchUserProfile(session.user.id);
              }
            } catch (error) {
              console.error("Error downgrading:", error);
              import("@/components/ui/use-toast").then(({ toast }) => {
                toast({
                  title: "Error",
                  description: "Failed to downgrade. Please try again.",
                  variant: "destructive",
                });
              });
            }
          }}
          onRemindLater={() => {
            localStorage.setItem("trialModalDismissed", new Date().toDateString());
            setShowTrialModal(false);
          }}
          onClose={() => setShowTrialModal(false)}
        />
      )}

      {showPricingModal && (
        <PricingModal
          isEarlyBird={true}
          loading={pricingLoading}
          onMonthlySelect={async () => {
            try {
              setPricingLoading(true);
              const { data, error } = await supabase.functions.invoke("create-checkout", {
                body: { priceId: "price_1SI3KoRjwBUM0ZBtUskqXPiY" },
                headers: {
                  Authorization: `Bearer ${session?.access_token}`,
                },
              });

              if (error) throw error;
              if (data?.url) {
                window.open(data.url, "_blank");
              }
            } catch (error) {
              console.error("Checkout error:", error);
              import("@/components/ui/use-toast").then(({ toast }) => {
                toast({
                  title: "Error",
                  description: "Failed to start checkout. Please try again.",
                  variant: "destructive",
                });
              });
            } finally {
              setPricingLoading(false);
              setShowPricingModal(false);
            }
          }}
          onUntilIDoSelect={async () => {
            try {
              setPricingLoading(true);
              const { data, error } = await supabase.functions.invoke("create-checkout", {
                body: { priceId: "price_1SI3OoRjwBUM0ZBtVaxRCLxP" },
                headers: {
                  Authorization: `Bearer ${session?.access_token}`,
                },
              });

              if (error) throw error;
              if (data?.url) {
                window.open(data.url, "_blank");
              }
            } catch (error) {
              console.error("Checkout error:", error);
              import("@/components/ui/use-toast").then(({ toast }) => {
                toast({
                  title: "Error",
                  description: "Failed to start checkout. Please try again.",
                  variant: "destructive",
                });
              });
            } finally {
              setPricingLoading(false);
              setShowPricingModal(false);
            }
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

        {/* Email verification page */}
        <Route path="/EmailVerification" element={<EmailVerification />} />

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
                weddingDate={new Date(profile?.wedding_date || new Date())}
                engagementDate={new Date(profile?.engagement_date || new Date())}
                budget={profile?.budget || 10000}
                spent={profile?.spent || 0}
                weddingVibeEmojis={["💍", "🌸", "💖"]}
                plannerCategories={plannerCategories}
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

        {/* Default root path - always goes to Auth */}
        <Route path="/" element={<Auth />} />
      </Routes>
    </>
  );
}

export default App;
