import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCurrentModeConfig } from "@/config/testMode";
import { ROUTES } from "@/constants/routes";

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
          toast.error("Authentication failed");
          navigate(ROUTES.AUTH);
          return;
        }

        if (!session) {
          navigate(ROUTES.AUTH);
          return;
        }

        const config = getCurrentModeConfig();

        // MODE 1: Skip DB, go straight to onboarding-chat
        if ("skipDatabaseCreation" in config && config.skipDatabaseCreation) {
          navigate(ROUTES.ONBOARDING_CHAT, { state: { userId: sessionStorage.getItem("bb_user_name") || session.user.email, userEmail: session.user.email } });
          return;
        }

        // Get user_id (name) from sessionStorage (set during signup), fallback to empty string
        let user_id = sessionStorage.getItem("bb_user_name") || "";

        // Always use session.user.email as email
        let email = session.user.email;

        // If user_id is not set in storage, try to get from profiles table using email
        if (!user_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("email", email)
            .single();
          user_id = profile?.user_id || "";
        }

        // Find profile by (user_id, email)
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("user_id", user_id)
          .eq("email", email)
          .single();

        // Check if user has onboarding data (optional, adjust as needed)
        const { data: timelineData } = await supabase
          .from("timeline")
          .select("engagement_date, wedding_date")
          .eq("user_id", user_id)
          .eq("email", email)
          .single();

        // New user (no profile OR no timeline data) → onboarding-chat
        if (!profileData || !timelineData?.engagement_date || !timelineData?.wedding_date) {
          navigate(ROUTES.ONBOARDING_CHAT, {
            state: { userId: user_id, userEmail: email },
          });
          return;
        }

        // Returning user with complete data → Chat
        navigate(ROUTES.CHAT);
      } catch (error) {
        navigate(ROUTES.AUTH);
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
