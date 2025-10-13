import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Mail, Sparkles } from "lucide-react";

const BrideBuddyNewUser = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("landing"); // landing, verification-sent, chatbot
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const logoUrl =
    "https://cdn.sanity.io/images/ot0hy8f4/production/c6a6e7f9b9e8f0e0e0e0e0e0e0e0e0e0e0e0e0e0-1024x1024.png";

  const handleSendVerification = () => {
    if (!name.trim() || !email.trim()) {
      alert("Please enter your name and email");
      return;
    }

    // In Lovable, this will trigger the magic link authentication
    // For now, we'll simulate it
    console.log("Sending verification to:", email);
    setStep("verification-sent");

    // Simulate email verification (in real app, user clicks link in email)
    // Remove this setTimeout in production - it's just for demo
    setTimeout(() => {
      navigate("/dashboard");
    }, 3000);
  };

  const handleStartPlanning = () => {
    const welcomeMessage = `Hi ${name}! Congratulations, I'm so excited to help you plan this special day. Let's start building your dream Wedding Dashboard from scratch. Let me ask you a few questions first: when did you get engaged? 💍`;

    setMessages([
      { type: "user", text: "Let's start planning my wedding!" },
      { type: "bot", text: welcomeMessage },
    ]);
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    const userMessage = { type: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot responses based on conversation flow
    setTimeout(() => {
      let botResponse = "";

      if (messages.length === 2) {
        // After engagement date is provided
        botResponse =
          "Tell me about your relationship! Who is it? How did you meet? How long have you been together? Tell me everything! 💕";
      } else if (messages.length === 4) {
        botResponse = "That's so beautiful! 🥰 Do you have a wedding date set yet? If so, what's the date?";
      } else if (messages.length === 6) {
        botResponse =
          "Perfect! Have you booked a venue yet? If yes, which one? If not, do you have any venues in mind?";
      } else if (messages.length === 8) {
        botResponse =
          "Great! What's your vision for the wedding? (For example: elegant ballroom, rustic outdoor, beachside, intimate garden, modern chic, etc.)";
      } else if (messages.length === 10) {
        botResponse =
          "Love it! One more important question: Do you have a set budget for your wedding? If so, what's your total budget? 💰";
      } else if (messages.length === 12) {
        botResponse =
          "Perfect! Based on everything you've told me, I'm creating your personalized wedding vibe emojis that will appear on your dashboard. These capture the essence of your special day and you can always change them if your vision evolves! ✨";
      } else {
        botResponse =
          "Wonderful! I'm building your personalized dashboard now with all this information. You can always update these details later. Ready to see your dashboard? 📊";
      }

      setMessages((prev) => [...prev, { type: "bot", text: botResponse }]);
    }, 1000);
  };

  // LANDING PAGE - Account Creation
  if (step === "landing") {
    return (
      <div className="w-full h-screen max-w-md mx-auto bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-6">
        <div className="flex-1 flex items-center justify-center">
          <img src={logoUrl} alt="Bride Buddy Logo" className="w-80 h-80 drop-shadow-2xl" />
        </div>

        <div className="w-full space-y-4 pb-8">
          <h2
            className="text-2xl font-bold text-center text-purple-400 mb-6"
            style={{ fontFamily: "Quicksand, sans-serif" }}
          >
            Create Your Account
          </h2>

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
            onClick={() => alert("Sign in functionality - connect to Lovable auth")}
            className="text-xs text-center text-gray-400 hover:text-purple-400 transition-colors"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    );
  }

  // VERIFICATION SENT PAGE
  if (step === "verification-sent") {
    return (
      <div className="w-full h-screen max-w-md mx-auto bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-purple-200 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Mail size={48} className="text-purple-400" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-purple-400" style={{ fontFamily: "Quicksand, sans-serif" }}>
              Check Your Email! 📧
            </h2>
            <p className="text-gray-600 px-6">
              We sent a verification link to
              <br />
              <span className="font-semibold text-purple-400">{email}</span>
            </p>
            <p className="text-sm text-gray-500 px-6">
              Click the link in the email to verify your account and start planning your dream wedding! 💍
            </p>
          </div>

          <div className="pt-6">
            <Sparkles className="text-purple-300 mx-auto animate-bounce" size={32} />
          </div>
        </div>
      </div>
    );
  }

  // CHATBOT INTERFACE - After Email Verification
  if (step === "chatbot") {
    return (
      <div className="w-full h-screen max-w-md mx-auto bg-white shadow-2xl flex flex-col">
        {messages.length === 0 ? (
          // Initial chatbot landing - before conversation starts
          <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-blue-100 via-purple-100 to-pink-50">
            <div className="flex-1 flex items-center justify-center">
              <img src={logoUrl} alt="Bride Buddy Logo" className="w-64 h-64 drop-shadow-lg" />
            </div>

            <div className="w-full space-y-4">
              <button
                onClick={handleStartPlanning}
                className="w-full bg-gradient-to-r from-purple-300 to-blue-300 text-white py-5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 text-lg font-bold"
              >
                Let's start planning your wedding! 💍
              </button>

              <p className="text-sm text-center text-gray-500">
                I'll ask you a few questions to personalize your experience
              </p>
            </div>
          </div>
        ) : (
          // Chat interface - after conversation starts
          <>
            <div className="bg-gradient-to-r from-purple-300 to-blue-300 px-4 py-3 flex items-center shadow-md">
              <img src={logoUrl} alt="Bride Buddy" className="w-10 h-10 rounded-full bg-white p-1" />
              <span className="text-white font-semibold text-sm ml-3">Bride Buddy</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      msg.type === "user"
                        ? "bg-purple-300 text-white rounded-br-sm"
                        : "bg-white text-gray-800 shadow-md rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your answer..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-purple-300"
                />
                <button
                  onClick={() => handleSendMessage(inputValue)}
                  className="bg-purple-300 hover:bg-purple-400 p-3 rounded-full transition-all shadow-md"
                >
                  <Send className="text-white" size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
};

export default BrideBuddyNewUser;
