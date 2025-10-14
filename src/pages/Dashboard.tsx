import React from "react";
import { LayoutDashboard, CheckSquare, ArrowLeft, DollarSign, Calendar } from "lucide-react";

interface Task {
  task: string;
  completed: boolean;
}

interface PlannerCategory {
  category: string;
  emoji: string;
  vendor: string;
  phone: string;
  tasks: Task[];
}

interface DashboardProps {
  userName: string;
  weddingDate: Date;
  engagementDate: Date;
  budget: number;
  spent: number;
  weddingVibeEmojis: string[];
  plannerCategories: PlannerCategory[];
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  userName,
  weddingDate,
  engagementDate,
  budget,
  spent,
  weddingVibeEmojis,
  plannerCategories,
  onNavigate,
}) => {
  // --- Calculations ---
  const getDaysUntilWedding = () => {
    const today = new Date();
    const diffTime = weddingDate.getTime() - today.getTime();
    return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
  };

  const getTimelineProgress = () => {
    const today = new Date();
    const totalTime = weddingDate.getTime() - engagementDate.getTime();
    const elapsed = today.getTime() - engagementDate.getTime();
    return Math.min(Math.max((elapsed / totalTime) * 100, 0), 100);
  };

  const getTodaysFocus = () => {
    const incompleteTasks: { task: string; emoji: string; vendor: string; phone: string }[] = [];

    plannerCategories.forEach((cat) => {
      if (cat.tasks) {
        cat.tasks.forEach((task) => {
          if (!task.completed) {
            incompleteTasks.push({
              task: task.task,
              emoji: cat.emoji,
              vendor: cat.vendor,
              phone: cat.phone,
            });
          }
        });
      }
    });

    return incompleteTasks.slice(0, 4);
  };

  // --- Values ---
  const daysUntil = getDaysUntilWedding();
  const progress = getTimelineProgress();
  const todaysTasks = getTodaysFocus();

  // --- UI ---
  return (
    <div className="w-full h-screen max-w-md mx-auto bg-white shadow-2xl">
      <div className="h-full overflow-y-auto bg-gradient-to-b from-purple-100 to-blue-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-300 to-blue-300 px-4 py-3 flex items-center justify-between shadow-md">
          <button
            onClick={() => onNavigate("chat")}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <span className="text-white font-semibold">Dashboard</span>
          <div className="w-9"></div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Days Until Wedding */}
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="flex justify-center gap-2 mb-4">
              {weddingVibeEmojis.length > 0 ? (
                weddingVibeEmojis.map((emoji, idx) => (
                  <span key={idx} className="text-3xl">
                    {emoji}
                  </span>
                ))
              ) : (
                <span className="text-3xl">💍</span>
              )}
            </div>
            <h2 className="text-4xl font-bold text-purple-400 mb-2">{daysUntil}</h2>
            <p className="text-gray-600 font-medium">days until “I Do”</p>
          </div>

          {/* Budget Summary (clickable) */}
          <div
            className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all"
            onClick={() => onNavigate("planner")}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-purple-400" />
              Budget Overview
            </h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">${spent.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mt-1">of ${budget.toLocaleString()} spent</div>
              </div>

              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-purple-300 to-blue-300 transition-all duration-500"
                  style={{ width: `${Math.min((spent / budget) * 100, 100)}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>${Math.max(budget - spent, 0).toLocaleString()} remaining</span>
                <span>{Math.round((spent / budget) * 100)}% used</span>
              </div>

              <div className="text-xs text-center text-purple-400 font-medium mt-4">
                Tap to view full wedding planner →
              </div>
            </div>
          </div>

          {/* Wedding Timeline */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-purple-400" />
              Wedding Timeline
            </h3>
            <div className="space-y-4">
              <div className="relative h-16 bg-gray-100 rounded-lg overflow-visible px-4">
                <div
                  className="absolute top-1/2 left-0 w-full h-1 bg-gray-200"
                  style={{ transform: "translateY(-50%)" }}
                ></div>

                <div
                  className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-300 to-blue-300 transition-all duration-500"
                  style={{ width: `${progress}%`, transform: "translateY(-50%)" }}
                ></div>

                <div
                  className="absolute top-1/2 text-2xl z-10 transition-all duration-500"
                  style={{ left: `${progress}%`, transform: "translate(-50%, -50%)" }}
                >
                  🚗
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center">
                {Math.round(progress)}% of your engagement journey completed
              </p>
            </div>
          </div>

          {/* Focus Tasks */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckSquare size={20} className="text-purple-400" />
              Your Focus Today
            </h3>

            {todaysTasks.length > 0 ? (
              <div className="space-y-3">
                {todaysTasks.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 mb-1">{item.task}</p>
                        <p className="text-xs text-gray-500">
                          {item.vendor} • {item.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center">You’re all caught up for today! 🎉</p>
            )}

            <button
              onClick={() => onNavigate("planner")}
              className="w-full mt-4 text-sm text-purple-400 hover:text-purple-500 font-medium transition-colors"
            >
              View full wedding planner →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
