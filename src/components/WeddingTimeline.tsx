import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { differenceInDays, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface TimelineData {
  engagement_date: string | null;
  wedding_date: string | null;
  car_position: number;
  completed_tasks: number;
}

interface ChecklistItem {
  id: string;
  task_name: string;
  emoji: string | null;
  completed: boolean;
  created_at: string;
}

interface WeddingTimelineProps {
  userId: string;
}

const WeddingTimeline = ({ userId }: WeddingTimelineProps) => {
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [completedTasks, setCompletedTasks] = useState<ChecklistItem[]>([]);
  const [currentDay, setCurrentDay] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadTimeline();
    loadCompletedTasks();
  }, [userId]);

  const loadTimeline = async () => {
    const { data, error } = await supabase
      .from('timeline')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load timeline",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setTimeline(data);
      
      if (data.engagement_date && data.wedding_date) {
        const engagementDate = new Date(data.engagement_date);
        const weddingDate = new Date(data.wedding_date);
        const today = new Date();
        
        const total = differenceInDays(weddingDate, engagementDate);
        const current = differenceInDays(today, engagementDate);
        
        setTotalDays(total);
        setCurrentDay(Math.max(0, Math.min(current, total)));
      }
    }
  };

  const loadCompletedTasks = async () => {
    const { data, error } = await supabase
      .from('checklist')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setCompletedTasks(data);
    }
  };

  if (!timeline || !timeline.engagement_date || !timeline.wedding_date) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          Complete your onboarding to set up your wedding timeline! 💍
        </p>
      </Card>
    );
  }

  const daysUntilWedding = totalDays - currentDay;
  const progressPercentage = totalDays > 0 ? (currentDay / totalDays) * 100 : 0;

  // Create timeline slots (showing 15 key milestones)
  const timelineSlots = 15;
  const slotInterval = totalDays / (timelineSlots - 1);
  
  const renderTimelineSlots = () => {
    const slots = [];
    
    for (let i = 0; i < timelineSlots; i++) {
      const slotDay = Math.round(i * slotInterval);
      const isCarPosition = Math.abs(slotDay - currentDay) < slotInterval / 2;
      
      // Check if this slot should show a completed task
      const taskForSlot = completedTasks[i];
      
      if (i === 0) {
        // Engagement date
        slots.push(
          <div key={i} className="flex flex-col items-center">
            <div className="text-3xl mb-1 animate-scale-in">💎</div>
            <div className="text-xs text-muted-foreground">Start</div>
          </div>
        );
      } else if (i === timelineSlots - 1) {
        // Wedding date
        slots.push(
          <div key={i} className="flex flex-col items-center">
            <div className="text-3xl mb-1 animate-scale-in">💑❤️</div>
            <div className="text-xs text-muted-foreground">Wedding</div>
          </div>
        );
      } else if (isCarPosition && currentDay < totalDays) {
        // Car current position
        slots.push(
          <div key={i} className="flex flex-col items-center">
            <div className="text-3xl mb-1 animate-bounce">🚗</div>
            <div className="text-xs font-bold text-primary">Today</div>
          </div>
        );
      } else if (taskForSlot) {
        // Completed task
        slots.push(
          <div key={i} className="flex flex-col items-center">
            <div className="text-3xl mb-1 animate-scale-in">{taskForSlot.emoji || "✅"}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[60px]" title={taskForSlot.task_name}>
              {taskForSlot.task_name}
            </div>
          </div>
        );
      } else {
        // Empty slot
        slots.push(
          <div key={i} className="flex flex-col items-center">
            <div className="text-3xl mb-1 opacity-30">⚪</div>
            <div className="text-xs text-muted-foreground">-</div>
          </div>
        );
      }
    }
    
    return slots;
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Wedding Journey Timeline 🚗💍</h2>

      {/* Progress Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-4 text-center bg-accent/30">
          <p className="text-sm text-muted-foreground mb-1">Days Passed</p>
          <p className="text-3xl font-bold text-primary">{currentDay}</p>
        </Card>
        <Card className="p-4 text-center bg-primary/10">
          <p className="text-sm text-muted-foreground mb-1">Days Until Wedding</p>
          <p className="text-3xl font-bold text-primary">{daysUntilWedding}</p>
        </Card>
        <Card className="p-4 text-center bg-accent/30">
          <p className="text-sm text-muted-foreground mb-1">Total Journey</p>
          <p className="text-3xl font-bold text-primary">{totalDays}</p>
        </Card>
      </div>

      {/* Daily Update Message */}
      <Card className="p-4 mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <p className="text-center font-medium mb-2">
          Day {currentDay} of your wedding journey 🚗💍
        </p>
        {completedTasks.length > 0 && (
          <p className="text-sm text-center text-muted-foreground">
            You've completed {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''} — keep moving toward the big day 💑❤️!
          </p>
        )}
      </Card>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            {format(new Date(timeline.engagement_date), 'MMM dd, yyyy')}
          </span>
          <span className="font-medium text-primary">{Math.round(progressPercentage)}%</span>
          <span className="text-muted-foreground">
            {format(new Date(timeline.wedding_date), 'MMM dd, yyyy')}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-4 overflow-hidden shadow-inner">
          <div 
            className="h-4 bg-gradient-to-r from-primary via-primary-glow to-primary rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute right-0 top-0 h-full w-8 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Your Journey Map</h3>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary-glow to-primary opacity-30" />
          
          {/* Timeline Slots */}
          <div className="flex justify-between items-start relative z-10">
            {renderTimelineSlots()}
          </div>
        </div>
      </div>

      {/* Completed Tasks List */}
      {completedTasks.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Completed Milestones</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {completedTasks.map((task) => (
              <div 
                key={task.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-accent/50 animate-fade-in"
              >
                <span className="text-2xl">{task.emoji || "✅"}</span>
                <span className="text-sm truncate">{task.task_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Message */}
      <Card className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-primary-glow/10 text-center">
        <p className="text-lg font-medium">
          {daysUntilWedding > 30 
            ? `You're doing great! ${daysUntilWedding} days until your special day! 💖`
            : daysUntilWedding > 7
            ? `Getting close! Only ${daysUntilWedding} days to go! 🎉`
            : daysUntilWedding > 0
            ? `Final countdown! ${daysUntilWedding} days left! 💍✨`
            : `Today is the day! Congratulations! 🎊💑`
          }
        </p>
      </Card>
    </Card>
  );
};

export default WeddingTimeline;
