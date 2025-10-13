// ChatbotDashboard.jsx
import { useNavigate } from "react-router-dom";
import { LayoutGrid } from "lucide-react";

const ChatbotDashboard = () => {
  const navigate = useNavigate();

  const handleBrideDashboardClick = () => {
    navigate("/bride-dashboard");
  };

  return (
    <div className="chatbot-dashboard relative flex flex-col h-screen bg-white">
      {/* Top bar with icon */}
      <div className="flex justify-end p-4 bg-gray-50 shadow-md">
        <button
          onClick={handleBrideDashboardClick}
          className="text-gray-700 hover:text-blue-500 focus:outline-none"
          aria-label="Open Bride Dashboard"
        >
          <LayoutGrid size={24} />
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {/* Example AI message */}
        <div className="message bg-gray-200 p-3 rounded self-start max-w-xs">Hi there! I’m ready to help you.</div>

        {/* Initial suggested prompt */}
        <div
          onClick={handleBrideDashboardClick}
          className="suggested-prompt cursor-pointer bg-blue-500 text-white p-3 rounded self-start max-w-xs hover:bg-blue-600 transition"
        >
          Check out your Bride Dashboard
        </div>

        {/* Additional chatbot messages would go here */}
      </div>
    </div>
  );
};

export default ChatbotDashboard;
