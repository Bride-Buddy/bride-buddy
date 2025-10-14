import React, { useState } from "react";
import { Send } from "lucide-react";

interface NewUserSignupProps {
  onSignupComplete?: () => void;
  onNavigateToSignIn?: () => void;
}

const NewUserSignup: React.FC<NewUserSignupProps> = ({ onSignupComplete, onNavigateToSignIn }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const logoUrl =
    "https://cdn.sanity.io/images/ot0hy8f4/production/c6a6e7f9b9e8f0e0e0e0e0e0e0e0e0e0e0e0e0e0-1024x1024.png";

  const handleSendVerification = () => {
    if (!name.trim() || !email.trim()) {
      alert("Please enter your name and email");
      return;
    }

    // In Lovable, this will trigger magic link authentication
    console.log("Sending verification to:", email);

    // Call the callback when signup is complete
    if (onSignupComplete) {
      onSignupComplete();
    }
  };

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
              onKeyPress={(e) => e.key === "Enter" && handleSendVerification()}
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
          onClick={onNavigateToSignIn}
          className="text-xs text-center text-gray-400 hover:text-purple-400 transition-colors w-full"
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
};

export default NewUserSignup;
