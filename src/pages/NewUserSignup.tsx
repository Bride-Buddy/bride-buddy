import React from "react";
import { Button } from "@/components/ui/button";

interface NewUserSignupProps {
  onSignupComplete: () => void;
  onNavigateToSignIn: () => void;
}

const NewUserSignup: React.FC<NewUserSignupProps> = ({
  onSignupComplete,
  onNavigateToSignIn,
}) => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-blue-50">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-400">
          Welcome to Bride Buddy! 💕
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Let's start planning your dream wedding
        </p>
        <div className="space-y-4">
          <Button
            onClick={onSignupComplete}
            className="w-full bg-gradient-to-r from-purple-400 to-blue-400 text-white py-6"
          >
            Get Started
          </Button>
          <Button
            onClick={onNavigateToSignIn}
            variant="outline"
            className="w-full"
          >
            Already have an account? Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewUserSignup;
