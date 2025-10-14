import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCurrentModeConfig } from "@/config/testMode";

const AuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth redirect error:", error);
          toast.error("Authentication failed");
          navigate("/auth");
          return;
        }

        if (!session) {
          navigate("/auth");
          return;
        }

        const config = getCurrentModeConfig();

        // MODE 1: Skip DB, go straight to onboarding-chat
        if ("skipDatabaseCreation" in config && config.skipDatabaseCreation) {
          navigate("/onboarding-chat", { state: { userId: session.user.id, userName: session.user.email } });
          return;
        }

        // MODE 2 & 3: Check if user has completed onboarding
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", session.user.id)
          .single();

        // Check if user has onboarding data
        const { data: timelineData } = await supabase
          .from("timeline")
          .select("engagement_date, wedding_date")
          .eq("user_id", session.user.id)
          .single();

        // New user (no profile OR no timeline data) → onboarding-chat
        if (!profileData || !timelineData?.engagement_date || !timelineData?.wedding_date) {
          navigate("/onboarding-chat", {
            state: { userId: session.user.id, userName: profileData?.full_name || session.user.email },
          });
          return;
        }

        // Returning user with complete data → Dashboard
        navigate("/dashboard");
      } catch (error) {
        console.error("Unexpected error:", error);
        navigate("/auth");
      }
    };

    handleAuthRedirect();
  }, [navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
        <p className="text-gray-600">Setting up your wedding planning journey... 💕</p>
      </div>
    </div>
  );
};

export default AuthRedirect;
