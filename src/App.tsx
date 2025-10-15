import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Toaster } from "@/components/ui/toaster";
import {
  getCurrentModeConfig,
  showTestModeIndicator,
  getDaysRemainingInTrial as getTrialDaysRemaining,
  getTrialEndDate as formatTrialEndDate,
  getTrialUnitLabel,
} from "@/config/testMode";

import Chat from "./components/Chat";
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
      const trialEnd = formatTrialEndDate(trialStart);
      const config = getCurrentModeConfig();

      const diffTime = new Date(trialEnd).getTime() - now.getTime();
      const daysRemaining = getTrialDaysRemaining(profile.trial_start_date);

      // Check localStorage for last dismissal
      const lastDismissed = localStorage.getItem("trialModalDismissed");
      const today = now.toDateString();

      // Determine when to show modal based on test mode
      const shouldShowModal = showTestModeIndicator
        ? daysRemaining <= 5 // Show when 5 units or less remaining
        : (daysRemaining === 5 || daysRemaining === 3 || daysRemaining <= 1) && daysRemaining > 0;

      if (shouldShowModal && lastDismissed !== today) {
        setShowTrialModal(true);
      }

      // Show toast notifications (only in production mode)
      if (!showTestModeIndicator && lastTrialNotification !== today) {
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

  const getDaysRemainingLocal = () => {
    if (!profile?.trial_start_date) return 0;
    return getTrialDaysRemaining(profile.trial_start_date);
  };

  const getTrialEndDateLocal = () => {
    if (!profile?.trial_start_date) return "";
    const trialEnd = formatTrialEndDate(new Date(profile.trial_start_date));
    const config = getCurrentModeConfig();

    if ("trialDurationSeconds" in config || "trialDurationMinutes" in config) {
      return new Date(trialEnd).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else {
      return new Date(trialEnd).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
    }
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

      {/* Test Mode Indicator */}
      {showTestModeIndicator && (
        <div className="fixed top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-lg shadow-lg font-bold text-sm z-50">
          🧪 TEST MODE{" "}
          {(() => {
            const config = getCurrentModeConfig();
            if ("trialDurationSeconds" in config) return `(${config.trialDurationSeconds}-second trial)`;
            if ("trialDurationMinutes" in config) return `(${config.trialDurationMinutes}-minute trial)`;
            if ("trialDurationDays" in config) return `(${config.trialDurationDays}-day trial)`;
            return "";
          })()}
        </div>
      )}

      {/* 💌 Modals */}
      {showTrialModal && (
        <TrialExpirationModal
          daysRemaining={getDaysRemainingLocal()}
          trialEndDate={getTrialEndDateLocal()}
          onUpgradeClick={async () => {
            const config = getCurrentModeConfig();

            // Test Mode 1: Instant VIP upgrade without Stripe
            if (config.instantVIPUpgrade && !config.showStripeCheckout) {
              try {
                const { error } = await supabase
                  .from("profiles")
                  .update({ subscription_tier: "vip" })
                  .eq("user_id", session?.user?.id);

                if (error) throw error;

                setShowTrialModal(false);

                import("@/components/ui/use-toast").then(({ toast }) => {
                  toast({
                    title: "Welcome to VIP! 💎",
                    description: "You now have full access to all features!",
                  });
                });

                if (session?.user?.id) {
                  fetchUserProfile(session.user.id);
                }
              } catch (error) {
                console.error("Error upgrading:", error);
                import("@/components/ui/use-toast").then(({ toast }) => {
                  toast({
                    title: "Error",
                    description: "Failed to upgrade. Please try again.",
                    variant: "destructive",
                  });
                });
              }
              return;
            }

            // Test Mode 2/3 & Production: Show pricing modal with Stripe
            setShowTrialModal(false);
            setShowPricingModal(true);
          }}
          onBasicClick={async () => {
            const config = getCurrentModeConfig();

            // Test Mode 1: No basic tier
            if (!config.hasBasicTier) {
              setShowTrialModal(false);
              return;
            }

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
          element={!session ? <Auth /> : <Navigate to={needsOnboarding ? "/onboarding-chat" : "/chat"} />}
        />

        {/* Email verification page */}
        <Route path="/email-verification" element={<EmailVerification />} />

        {/* Post-login redirect handler */}
        <Route path="/auth-redirect" element={<AuthRedirect />} />

        {/* Onboarding for new users */}
        <Route
          path="/onboarding-chat"
          element={
            session && profile ? (
              <OnboardingChat userId={session.user.id} userName={profile.full_name || ""} />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />

        {/* Main chat interface */}
        <Route path="/chat" element={session ? <Chat userId={session.user.id} /> : <Navigate to="/auth" />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={session ? <Dashboard userId={session.user.id} /> : <Navigate to="/auth" />} />

        {/* Planner */}
        <Route
          path="/planner"
          element={
            session ? (
              <Planner budget={0} spent={0} plannerCategories={[]} onNavigate={(view) => navigate(`/${view}`)} />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </>
  );
}

export default App;
