import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Calendar, 
  CheckCircle2, 
  Circle,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  DollarSign,
  Users,
  MapPin
} from "lucide-react";

interface BrideDashboardProps {
  userId: string;
}

interface Profile {
  full_name: string;
  wedding_date: string | null;
}

interface Timeline {
  engagement_date: string | null;
  wedding_date: string | null;
}

interface ChecklistItem {
  id: string;
  task_name: string;
  emoji: string | null;
  completed: boolean;
  due_date: string | null;
  created_at: string;
}

const BrideDashboard = ({ userId }: BrideDashboardProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    setLoading(true);
    
    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, wedding_date')
      .eq('user_id', userId)
      .single();
    
    // Load timeline
    const { data: timelineData } = await supabase
      .from('timeline')
      .select('engagement_date, wedding_date')
      .eq('user_id', userId)
      .single();
    
    // Load checklist
    const { data: checklistData } = await supabase
      .from('checklist')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    setProfile(profileData);
    setTimeline(timelineData);
    setChecklist(checklistData || []);
    setLoading(false);
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    await supabase
      .from('checklist')
      .update({ completed: !currentStatus })
      .eq('id', taskId);
    
    loadDashboardData();
  };

  const getWeddingStatus = () => {
    if (!timeline?.engagement_date) return "Just Starting ✨";
    
    const engagementDate = new Date(timeline.engagement_date);
    const today = new Date();
    const monthsSinceEngagement = Math.floor(
      (today.getTime() - engagementDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    
    if (monthsSinceEngagement < 2) return "Newly Engaged ✨";
    if (monthsSinceEngagement < 6) return "Early Planning 🌸";
    if (monthsSinceEngagement < 12) return "Mid Planning 💐";
    return "Final Stretch 🎉";
  };

  const getMonthsUntilWedding = () => {
    if (!timeline?.wedding_date) return null;
    
    const weddingDate = new Date(timeline.wedding_date);
    const today = new Date();
    return Math.ceil(
      (weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
  };

  const getTasksForMonth = (monthOffset: number) => {
    const targetMonth = new Date();
    targetMonth.setMonth(targetMonth.getMonth() + monthOffset);
    
    return checklist.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return taskDate.getMonth() === targetMonth.getMonth() &&
             taskDate.getFullYear() === targetMonth.getFullYear();
    });
  };

  const getMonthLabel = (offset: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + offset);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getMilestones = () => {
    const milestones = [
      { 
        label: "Got Engaged 💍", 
        completed: !!timeline?.engagement_date,
        emoji: "💍"
      },
      { 
        label: "Set Wedding Date 🗓", 
        completed: !!timeline?.wedding_date,
        emoji: "🗓"
      },
      { 
        label: "Wedding Dress 👰", 
        completed: checklist.some(t => 
          t.task_name.toLowerCase().includes('dress') && t.completed
        ),
        emoji: "👰"
      },
      { 
        label: "Book Venue 🏡", 
        completed: checklist.some(t => 
          t.task_name.toLowerCase().includes('venue') && t.completed
        ),
        emoji: "🏡"
      },
      { 
        label: "Send Invitations 💌", 
        completed: checklist.some(t => 
          t.task_name.toLowerCase().includes('invitation') && t.completed
        ),
        emoji: "💌"
      },
      { 
        label: "Wedding Day 🎉", 
        completed: false,
        emoji: "🎉"
      }
    ];
    
    return milestones;
  };

  const completedCount = checklist.filter(t => t.completed).length;
  const totalCount = checklist.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const milestones = getMilestones();
  const completedMilestones = milestones.filter(m => m.completed).length;

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-pulse">Loading your dashboard...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          🌸 Bride Buddy Dashboard 🌸
        </h1>
        <p className="text-lg text-muted-foreground">
          Hi {profile?.full_name || 'Beautiful Bride'}! Here's your personalized planning dashboard. 💖
        </p>
      </div>

      {/* Summary Section */}
      <Card className="p-6 bg-gradient-to-br from-card to-accent/10 border-none shadow-[var(--shadow-elegant)]">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary fill-primary" />
          Summary
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Engagement Date</div>
            <div className="text-lg font-semibold">
              {timeline?.engagement_date 
                ? new Date(timeline.engagement_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  }) + ' 💍'
                : 'Not set yet 💍'}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Wedding Date</div>
            <div className="text-lg font-semibold">
              {timeline?.wedding_date 
                ? new Date(timeline.wedding_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  }) + ' 💑'
                : 'TBD 💑'}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Current Status</div>
            <div className="text-lg font-semibold">{getWeddingStatus()}</div>
          </div>
        </div>
        
        {getMonthsUntilWedding() && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
            <div className="text-sm font-medium text-primary">
              🗓 {getMonthsUntilWedding()} months until your special day!
            </div>
          </div>
        )}
      </Card>

      {/* Planning Progress / Checklist */}
      <Card className="p-6 bg-gradient-to-br from-card to-secondary/10 border-none shadow-[var(--shadow-elegant)]">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ListChecks className="w-6 h-6 text-primary" />
          Planning Progress
        </h2>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Milestones Completed</span>
            <span className="font-semibold">{completedMilestones} / {milestones.length}</span>
          </div>
          <Progress value={(completedMilestones / milestones.length) * 100} className="h-2" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {milestones.map((milestone, index) => (
            <Button
              key={index}
              variant={milestone.completed ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-center gap-2"
              disabled={index === milestones.length - 1}
            >
              <span className="text-2xl">{milestone.emoji}</span>
              <span className="text-xs text-center leading-tight">
                {milestone.label}
              </span>
              {milestone.completed && (
                <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
              )}
            </Button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span>Overall Tasks: {completedCount} / {totalCount} completed</span>
            <Badge variant="secondary">{Math.round(progressPercent)}%</Badge>
          </div>
          <Progress value={progressPercent} className="h-2 mt-2" />
        </div>
      </Card>

      {/* Month-by-Month Timeline */}
      <Card className="p-6 bg-gradient-to-br from-card to-accent/10 border-none shadow-[var(--shadow-elegant)]">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          Month-by-Month Timeline
        </h2>

        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonthOffset(prev => prev - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 grid grid-cols-3 gap-2">
            {[0, 1, 2].map(offset => {
              const monthOffset = currentMonthOffset + offset;
              const tasksInMonth = getTasksForMonth(monthOffset);
              
              return (
                <div key={offset} className="p-4 bg-muted rounded-lg">
                  <div className="font-semibold text-sm mb-3 text-center">
                    {getMonthLabel(monthOffset)}
                  </div>
                  
                  {tasksInMonth.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      No tasks scheduled
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasksInMonth.map(task => (
                        <div
                          key={task.id}
                          className="flex items-start gap-2 text-sm p-2 bg-card rounded hover:bg-accent/20 transition-colors cursor-pointer"
                          onClick={() => toggleTask(task.id, task.completed)}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.emoji && <span className="mr-1">{task.emoji}</span>}
                              {task.task_name}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonthOffset(prev => prev + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Action Prompts */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm">Guest List</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-sm">Add Venue</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-sm">Track Budget</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span className="text-sm">Add Task</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BrideDashboard;
