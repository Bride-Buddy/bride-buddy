import React from "react";
import { ArrowLeft, DollarSign } from "lucide-react";

interface Task {
  task: string;
  completed: boolean;
}

interface PlannerCategory {
  category: string;
  emoji: string;
  vendor: string;
  phone: string;
  totalCost: number;
  depositPaid: number;
  totalPaid: number;
  confirmed: boolean;
  tasks: Task[];
}

interface PlannerProps {
  budget: number;
  spent: number;
  plannerCategories: PlannerCategory[];
  onNavigate: (view: string) => void;
}

const Planner: React.FC<PlannerProps> = ({ budget = 0, spent = 0, plannerCategories = [], onNavigate }) => {
  return (
    <div className="w-full h-screen max-w-md mx-auto bg-white shadow-2xl">
      <div className="h-full overflow-y-auto bg-gradient-to-b from-purple-100 to-blue-100">
        <div className="bg-gradient-to-r from-purple-300 to-blue-300 px-4 py-3 flex items-center justify-between shadow-md">
          <button
            onClick={() => onNavigate("dashboard")}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <span className="text-white font-semibold">Wedding Planner</span>
          <div className="w-9"></div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-purple-400" />
              Budget Summary
            </h3>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-purple-400">${spent.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">of ${budget.toLocaleString()} spent</div>
            </div>
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-3">
              <div
                className="absolute h-full bg-gradient-to-r from-purple-300 to-blue-300 transition-all duration-500"
                style={{ width: `${(spent / budget) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>${(budget - spent).toLocaleString()} remaining</span>
              <span>{Math.round((spent / budget) * 100)}% used</span>
            </div>
          </div>

          {plannerCategories.map((category, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{category.emoji}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{category.category}</h3>
                  <p className="text-sm text-gray-600">{category.vendor}</p>
                  <p className="text-xs text-gray-500">{category.phone}</p>
                </div>
                <input
                  type="checkbox"
                  checked={category.confirmed}
                  className="w-6 h-6 text-purple-400 rounded"
                  readOnly
                  title="Confirmed 1 month prior"
                />
              </div>

              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Paid / Total Cost</span>
                  <span className="font-bold text-purple-400">
                    ${category.totalPaid.toLocaleString()} / ${category.totalCost.toLocaleString()}
                  </span>
                </div>
                {category.depositPaid > 0 && (
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                    <span>Deposit paid</span>
                    <span>${category.depositPaid.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {category.tasks.map((task, taskIdx) => (
                  <div key={taskIdx} className="flex items-start gap-3 p-2">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      className="w-5 h-5 text-purple-400 rounded mt-0.5"
                      readOnly
                    />
                    <p className={`text-sm flex-1 ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                      {task.task}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Planner;
