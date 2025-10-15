import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, Mail } from "lucide-react";
import logo from "@/assets/bride-buddy-logo-ring.png";
import { ROUTES } from "@/constants/routes";

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    // If no email in state, redirect back to auth
    if (!email) {
      navigate(ROUTES.AUTH);
    }
  }, [email, navigate]);

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-6">
      <div className="flex-1 flex items-center justify-center">
        <img src={logo} alt="Bride Buddy Logo" className="w-80 h-80 drop-shadow-2xl" />
      </div>

      <div className="w-full space-y-6 pb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="relative">
              <Mail className="w-20 h-20 text-purple-400" />
              <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>

          <div className="space-y-3">
            <h2
              className="text-2xl font-bold text-purple-400"
              style={{ fontFamily: "Quicksand, sans-serif" }}
            >
              Check Your Inbox! ✨
            </h2>
            
            <p className="text-gray-600 text-base">
              We've sent a magic link to
            </p>
            
            <p className="text-purple-500 font-semibold text-lg break-all">
              {email}
            </p>

            <div className="pt-4 space-y-2">
              <p className="text-gray-700 font-medium">
                Click the link in your email to continue your wedding planning journey! 💕
              </p>
              
              <p className="text-sm text-gray-500">
                The link will expire in 60 minutes
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Didn't receive the email?
            </p>
            <ul className="text-xs text-gray-500 space-y-1 text-left">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you entered the correct email</li>
              <li>• Wait a few minutes and check again</li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => navigate(ROUTES.AUTH)}
          className="w-full text-sm text-center text-purple-400 font-bold underline hover:text-purple-500 transition-colors"
        >
          ← Back to login
        </button>
      </div>
    </div>
  );
};

export default EmailVerification;
