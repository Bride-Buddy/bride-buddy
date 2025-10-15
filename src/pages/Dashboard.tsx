import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, DollarSign, TrendingUp, ListChecks } from "lucide-react";
import { ROUTES } from "@/constants/routes";

interface DashboardProps {
  userId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [timeline, setTimeline] = useState<any>(null);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase.from("profiles").select("*").eq("user_id", userId).single();

      // Fetch timeline
      const { data: timelineData } = await supabase.from("timeline").select("*").eq("user_id", userId).single();

      // Fetch checklist
      const { data: checklistData } = await supabase
        .from("checklist")
        .select("*")
        .eq("user_id", userId)
        .order("due_date", { ascending: true });

      // Fetch vendors
      const { data: vendorData } = await supabase.from("vendors").select("*").eq("user_id", userId);

      setProfile(profileData);
      setTimeline(timelineData);
      setChecklist(checklistData || []);
      setVendors(vendorData || []);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilWedding = (): number => {
    if (!timeline?.wedding_date) return 0;
    const today = new Date();
    const wedding = new Date(timeline.wedding_date);
    const diffTime = wedding.getTime() - today.getTime();
    return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
  };

  const getTimelineProgress = (): number => {
    if (!timeline?.engagement_date || !timeline?.wedding_date) return 0;
    const engagement = new Date(timeline.engagement_date);
    const wedding = new Date(timeline.wedding_date);
    const today = new Date();
    const totalTime = wedding.getTime() - engagement.getTime();
    const elapsed = today.getTime() - engagement.getTime();
    return Math.min(Math.max(Math.round((elapsed / totalTime) * 100), 0), 100);
  };

  const getTodaysFocus = () => {
    return checklist.filter((task) => !task.completed).slice(0, 4);
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  const totalBudget = vendors.reduce((sum, v) => sum + (Number(v.amount) || 0), 0);
  const spent = vendors.filter((v) => v.paid).reduce((sum, v) => sum + (Number(v.amount) || 0), 0);
  const daysUntilWedding = getDaysUntilWedding();
  const timelineProgress = getTimelineProgress();
  const todaysFocus = getTodaysFocus();
  const userName = profile?.full_name?.split(" ")[0] || "Beautiful Bride";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-purple-400" style={{ fontFamily: "Quicksand, sans-serif" }}>
              Welcome back, {userName}! 💕
            </h1>
            <p className="text-gray-600 mt-2">Here's your wedding planning overview</p>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = ROUTES.AUTH;
            }}
            className="px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Days Until Wedding */}
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="text-purple-400" size={24} />
              <h3 className="font-semibold text-gray-700">Wedding Countdown</h3>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-purple-400">{daysUntilWedding}</p>
              <p className="text-gray-600">Days Until Your Big Day! 💍</p>
            </div>
          </Card>

          {/* Budget Overview */}
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="text-purple-400" size={24} />
              <h3 className="font-semibold text-gray-700">Budget Status</h3>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">${spent.toLocaleString()}</p>
              <p className="text-gray-500 text-sm">of ${totalBudget.toLocaleString()}</p>
              <p className="text-green-600 font-medium mt-1">${(totalBudget - spent).toLocaleString()} remaining</p>
            </div>
          </Card>

          {/* Timeline Progress */}
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-purple-400" size={24} />
              <h3 className="font-semibold text-gray-700">Planning Progress</h3>
            </div>
            <div className="space-y-3">
              <Progress value={timelineProgress} className="h-3" />
              <p className="text-center text-gray-600 text-sm">{timelineProgress}% Complete</p>
            </div>
          </Card>
        </div>
        {/* Today's Focus */}
        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <ListChecks className="text-purple-400" size={24} />
            <h3 className="text-xl font-semibold text-gray-700">Today's Focus</h3>
          </div>
          <div className="space-y-3">
            {todaysFocus.length > 0 ? (
              todaysFocus.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-5 h-5 rounded-full border-2 border-purple-300 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{task.task_name}</p>
                    {task.due_date && (
                      <p className="text-sm text-gray-500 mt-1">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No tasks scheduled for today! 🎉</p>
            )}
          </div>
        </Card>
        {/* Action Buttons */}
        <Card className="p-6 bg-white shadow-lg">
          <div className="flex gap-4">
            <Button
              onClick={() => navigate(ROUTES.CHAT)}
              className="flex-1 bg-purple-400 hover:bg-purple-500 text-white py-6 text-lg"
            >
              💬 Chat with Bride Buddy
            </Button>
            <Button
              onClick={() => navigate(ROUTES.PLANNER)}
              variant="outline"
              className="flex-1 border-purple-300 text-purple-400 hover:bg-purple-50 py-6 text-lg"
            >
              📋 View Full Planner
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
