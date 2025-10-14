import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth redirect error:", error);
          toast.error("Authentication failed");
          navigate("/auth");
          return;
        }

        if (session) {
          // Check if user needs onboarding
          const { data: timelineData } = await supabase
            .from("timeline")
            .select("engagement_date, wedding_date")
            .eq("user_id", session.user.id)
            .single();

          if (!timelineData?.engagement_date || !timelineData?.wedding_date) {
            navigate("/onboarding");
          } else {
            navigate("/chat");
          }
        } else {
          navigate("/auth");
        }
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
        <p className="text-gray-600">Redirecting you...</p>
      </div>
    </div>
  );
};

export default AuthRedirect;
