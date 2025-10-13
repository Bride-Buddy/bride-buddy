import { useState } from "react";
import logo from "@/assets/bride-buddy-logo-ring.png";

interface DashboardProps {
  onBackToChat?: () => void;
}

export default function Dashboard({ onBackToChat }: DashboardProps) {
  const [expandedCake, setExpandedCake] = useState(true);
  const [expandedVenue, setExpandedVenue] = useState(false);
  const [expandedDress, setExpandedDress] = useState(false);
  const [expandedFlowers, setExpandedFlowers] = useState(false);
  const [expandedPhoto, setExpandedPhoto] = useState(false);
  const [expandedInvite, setExpandedInvite] = useState(false);

  const [cakeTasks, setCakeTasks] = useState([
    { id: "cake-1", label: "Schedule cake tastings", completed: true },
    { id: "cake-2", label: "Review quotes", completed: true },
    { id: "cake-3", label: "Pay deposit", completed: false },
    { id: "cake-4", label: "Sign agreement", completed: false },
    { id: "cake-5", label: "Schedule delivery", completed: false },
    { id: "cake-6", label: "Make final payment", completed: false },
  ]);

  const [venueTasks, setVenueTasks] = useState([
    { id: "venue-1", label: "Visit venues", completed: true },
    { id: "venue-2", label: "Book venue", completed: true },
    { id: "venue-3", label: "Pay deposit", completed: true },
    { id: "venue-4", label: "Finalize floor plan", completed: true },
    { id: "venue-5", label: "Confirm final headcount", completed: false },
  ]);

  const [dressTasks, setDressTasks] = useState([
    { id: "dress-1", label: "Browse dress styles", completed: true },
    { id: "dress-2", label: "Schedule appointments", completed: true },
    { id: "dress-3", label: "Order dress", completed: true },
    { id: "dress-4", label: "First fitting", completed: false },
    { id: "dress-5", label: "Final fitting", completed: false },
    { id: "dress-6", label: "Pick up dress", completed: false },
  ]);

  const [flowerTasks, setFlowerTasks] = useState([
    { id: "flowers-1", label: "Research florists", completed: true },
    { id: "flowers-2", label: "Schedule consultations", completed: false },
    { id: "flowers-3", label: "Choose arrangements", completed: false },
    { id: "flowers-4", label: "Sign contract", completed: false },
    { id: "flowers-5", label: "Final walkthrough", completed: false },
  ]);

  const [photoTasks, setPhotoTasks] = useState([
    { id: "photo-1", label: "Review portfolios", completed: true },
    { id: "photo-2", label: "Meet photographers", completed: true },
    { id: "photo-3", label: "Book photographer", completed: true },
    { id: "photo-4", label: "Engagement shoot", completed: true },
    { id: "photo-5", label: "Plan shot list", completed: false },
  ]);

  const [inviteTasks, setInviteTasks] = useState([
    { id: "invite-1", label: "Design invitations", completed: true },
    { id: "invite-2", label: "Order invitations", completed: true },
    { id: "invite-3", label: "Address envelopes", completed: true },
    { id: "invite-4", label: "Mail invitations", completed: true },
    { id: "invite-5", label: "Track RSVPs", completed: false },
  ]);

  const toggleCakeTask = (id: string) => {
    const newTasks = cakeTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setCakeTasks(newTasks);
  };

  const toggleVenueTask = (id: string) => {
    const newTasks = venueTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setVenueTasks(newTasks);
  };

  const toggleDressTask = (id: string) => {
    const newTasks = dressTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setDressTasks(newTasks);
  };

  const toggleFlowerTask = (id: string) => {
    const newTasks = flowerTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setFlowerTasks(newTasks);
  };

  const togglePhotoTask = (id: string) => {
    const newTasks = photoTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setPhotoTasks(newTasks);
  };

  const toggleInviteTask = (id: string) => {
    const newTasks = inviteTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setInviteTasks(newTasks);
  };

  const allTasks = [...cakeTasks, ...venueTasks, ...dressTasks, ...flowerTasks, ...photoTasks, ...inviteTasks];
  const totalTasks = allTasks.length;
  const completedTasksCount = allTasks.filter((t) => t.completed).length;
  const overallProgress = Math.round((completedTasksCount / totalTasks) * 100);

  const isCakeComplete = cakeTasks.every((t) => t.completed);
  const isVenueComplete = venueTasks.every((t) => t.completed);
  const isDressComplete = dressTasks.every((t) => t.completed);
  const isFlowersComplete = flowerTasks.every((t) => t.completed);
  const isPhotoComplete = photoTasks.every((t) => t.completed);
  const isInviteComplete = inviteTasks.every((t) => t.completed);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-purple-50 to-pink-50 pb-8">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={onBackToChat}
          className="hover:opacity-80 transition-opacity"
        >
          <img src={logo} alt="Bride Buddy" className="w-32 h-32 object-contain cursor-pointer" />
        </button>
        <span className="text-purple-600 font-semibold">Dashboard</span>
        <div className="w-32"></div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <div className="p-6 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 shadow-lg border-2 border-purple-200 rounded-lg">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="text-5xl">🔔</div>
            <div className="text-center">
              <div className="text-purple-600">369</div>
              <div className="text-purple-600">Days Until "I Do"</div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white shadow-md rounded-lg">
          <h2 className="mb-6 text-purple-600">Your Wedding Journey</h2>

          <div className="relative mb-8">
            <div className="h-2 bg-gray-200 rounded-full relative overflow-visible">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
                style={{ width: "30%" }}
              />

              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-purple-300">
                  💍
                </div>
              </div>

              {isCakeComplete && (
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: "8%" }}>
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-pink-300">
                    🎂
                  </div>
                </div>
              )}

              {isVenueComplete && (
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: "12%" }}>
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-pink-300">
                    🏛️
                  </div>
                </div>
              )}

              {isDressComplete && (
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: "16%" }}>
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-pink-300">
                    👰
                  </div>
                </div>
              )}

              {isFlowersComplete && (
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: "20%" }}>
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-pink-300">
                    💐
                  </div>
                </div>
              )}

              {isPhotoComplete && (
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: "24%" }}>
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-pink-300">
                    📸
                  </div>
                </div>
              )}

              {isInviteComplete && (
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: "28%" }}>
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-pink-300">
                    💌
                  </div>
                </div>
              )}

              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500"
                style={{ left: "30%" }}
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-purple-400">
                  🚗
                </div>
              </div>

              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-purple-300">
                  🔔
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-3 px-1">
              <span className="text-gray-600">Aug 15, 2024</span>
              <span className="text-gray-600">Oct 18, 2025</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Overall Progress</span>
              <span className="text-purple-600">{overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-gray-500 mt-2">
              {completedTasksCount} of {totalTasks} tasks completed
            </p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200 rounded-lg border">
          <div className="flex gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <p className="text-purple-900">
                🎂 Your Wedding Cake is falling behind! With 369 days until your wedding, I recommend prioritizing these
                tasks this week.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-purple-600 px-1">Your Checklist</h3>

          {/* Cake Category */}
          <div
            className={`overflow-hidden rounded-lg border shadow-sm ${isCakeComplete ? "border-2 border-green-300 bg-green-50" : "bg-white"}`}
          >
            <button
              onClick={() => setExpandedCake(!expandedCake)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎂</span>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span>Wedding Cake</span>
                    {isCakeComplete && <span className="text-green-600">✓</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-32 bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-purple-600 h-1 rounded-full"
                        style={{
                          width: `${Math.round((cakeTasks.filter((t) => t.completed).length / cakeTasks.length) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-gray-500">
                      {Math.round((cakeTasks.filter((t) => t.completed).length / cakeTasks.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-gray-400">{expandedCake ? "▲" : "▼"}</span>
            </button>
            {expandedCake && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                {cakeTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleCakeTask(task.id)}
                      id={task.id}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor={task.id}
                      className={`flex-1 cursor-pointer ${task.completed ? "line-through text-gray-400" : "text-gray-700"}`}
                    >
                      {task.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Venue Category */}
          <div
            className={`overflow-hidden rounded-lg border shadow-sm ${isVenueComplete ? "border-2 border-green-300 bg-green-50" : "bg-white"}`}
          >
            <button
              onClick={() => setExpandedVenue(!expandedVenue)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏛️</span>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span>Venue</span>
                    {isVenueComplete && <span className="text-green-600">✓</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-32 bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-purple-600 h-1 rounded-full"
                        style={{
                          width: `${Math.round((venueTasks.filter((t) => t.completed).length / venueTasks.length) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-gray-500">
                      {Math.round((venueTasks.filter((t) => t.completed).length / venueTasks.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-gray-400">{expandedVenue ? "▲" : "▼"}</span>
            </button>
            {expandedVenue && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                {venueTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleVenueTask(task.id)}
                      id={task.id}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor={task.id}
                      className={`flex-1 cursor-pointer ${task.completed ? "line-through text-gray-400" : "text-gray-700"}`}
                    >
                      {task.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dress Category */}
          <div
            className={`overflow-hidden rounded-lg border shadow-sm ${isDressComplete ? "border-2 border-green-300 bg-green-50" : "bg-white"}`}
          >
            <button
              onClick={() => setExpandedDress(!expandedDress)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">👰</span>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span>Wedding Dress</span>
                    {isDressComplete && <span className="text-green-600">✓</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-32 bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-purple-600 h-1 rounded-full"
                        style={{
                          width: `${Math.round((dressTasks.filter((t) => t.completed).length / dressTasks.length) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-gray-500">
                      {Math.round((dressTasks.filter((t) => t.completed).length / dressTasks.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-gray-400">{expandedDress ? "▲" : "▼"}</span>
            </button>
            {expandedDress && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                {dressTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleDressTask(task.id)}
                      id={task.id}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor={task.id}
                      className={`flex-1 cursor-pointer ${task.completed ? "line-through text-gray-400" : "text-gray-700"}`}
                    >
                      {task.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flowers Category */}
          <div
            className={`overflow-hidden rounded-lg border shadow-sm ${isFlowersComplete ? "border-2 border-green-300 bg-green-50" : "bg-white"}`}
          >
            <button
              onClick={() => setExpandedFlowers(!expandedFlowers)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💐</span>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span>Flowers</span>
                    {isFlowersComplete && <span className="text-green-600">✓</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-32 bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-purple-600 h-1 rounded-full"
                        style={{
                          width: `${Math.round((flowerTasks.filter((t) => t.completed).length / flowerTasks.length) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-gray-500">
                      {Math.round((flowerTasks.filter((t) => t.completed).length / flowerTasks.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-gray-400">{expandedFlowers ? "▲" : "▼"}</span>
            </button>
            {expandedFlowers && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                {flowerTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleFlowerTask(task.id)}
                      id={task.id}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor={task.id}
                      className={`flex-1 cursor-pointer ${task.completed ? "line-through text-gray-400" : "text-gray-700"}`}
                    >
                      {task.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Photography Category */}
          <div
            className={`overflow-hidden rounded-lg border shadow-sm ${isPhotoComplete ? "border-2 border-green-300 bg-green-50" : "bg-white"}`}
          >
            <button
              onClick={() => setExpandedPhoto(!expandedPhoto)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📸</span>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span>Photography</span>
                    {isPhotoComplete && <span className="text-green-600">✓</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-32 bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-purple-600 h-1 rounded-full"
                        style={{
                          width: `${Math.round((photoTasks.filter((t) => t.completed).length / photoTasks.length) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-gray-500">
                      {Math.round((photoTasks.filter((t) => t.completed).length / photoTasks.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-gray-400">{expandedPhoto ? "▲" : "▼"}</span>
            </button>
            {expandedPhoto && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                {photoTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => togglePhotoTask(task.id)}
                      id={task.id}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor={task.id}
                      className={`flex-1 cursor-pointer ${task.completed ? "line-through text-gray-400" : "text-gray-700"}`}
                    >
                      {task.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invitations Category */}
          <div
            className={`overflow-hidden rounded-lg border shadow-sm ${isInviteComplete ? "border-2 border-green-300 bg-green-50" : "bg-white"}`}
          >
            <button
              onClick={() => setExpandedInvite(!expandedInvite)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💌</span>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span>Invitations</span>
                    {isInviteComplete && <span className="text-green-600">✓</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-32 bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-purple-600 h-1 rounded-full"
                        style={{
                          width: `${Math.round((inviteTasks.filter((t) => t.completed).length / inviteTasks.length) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-gray-500">
                      {Math.round((inviteTasks.filter((t) => t.completed).length / inviteTasks.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-gray-400">{expandedInvite ? "▲" : "▼"}</span>
            </button>
            {expandedInvite && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                {inviteTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleInviteTask(task.id)}
                      id={task.id}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor={task.id}
                      className={`flex-1 cursor-pointer ${task.completed ? "line-through text-gray-400" : "text-gray-700"}`}
                    >
                      {task.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
