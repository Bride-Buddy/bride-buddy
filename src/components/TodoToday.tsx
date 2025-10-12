import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, ChevronRight } from "lucide-react";
import { format, isToday, isThisWeek, isTomorrow, addDays, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ChecklistItem {
  id: string;
  task_name: string;
  emoji: string | null;
  due_date: string | null;
  completed: boolean;
}

interface TodoTodayProps {
  userId: string;
}

type FilterType = "today" | "week" | "upcoming";

const TodoToday = ({ userId }: TodoTodayProps) => {
  const [tasks, setTasks] = useState<ChecklistItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("today");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, [userId, filter]);

  const loadTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('checklist')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (data) {
      const filtered = filterTasks(data);
      setTasks(filtered);
    }
    setLoading(false);
  };

  const filterTasks = (allTasks: ChecklistItem[]) => {
    const now = new Date();
    
    switch (filter) {
      case "today":
        return allTasks.filter(task => 
          task.due_date && isToday(new Date(task.due_date))
        );
      
      case "week":
        return allTasks.filter(task => 
          task.due_date && isThisWeek(new Date(task.due_date), { weekStartsOn: 0 })
        );
      
      case "upcoming":
        const nextWeek = addDays(now, 7);
        return allTasks.filter(task => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          return dueDate >= now && dueDate <= nextWeek && !task.completed;
        });
      
      default:
        return allTasks;
    }
  };

  const toggleTask = async (task: ChecklistItem) => {
    const { error } = await supabase
      .from('checklist')
      .update({ completed: !task.completed })
      .eq('id', task.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
      return;
    }

    if (!task.completed) {
      // Update timeline
      const { data: timelineData } = await supabase
        .from('timeline')
        .select('completed_tasks')
        .eq('user_id', userId)
        .single();

      if (timelineData) {
        await supabase
          .from('timeline')
          .update({ 
            completed_tasks: (timelineData.completed_tasks || 0) + 1 
          })
          .eq('user_id', userId);
      }

      toast({
        title: `You just completed '${task.task_name}' ${task.emoji || '✅'}`,
        description: "Your timeline is rolling! Keep moving toward the big day 💑❤️",
        duration: 4000,
      });
    }

    loadTasks();
  };

  const getMotivationalMessage = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    if (totalTasks === 0) {
      return filter === "today" 
        ? "No tasks due today! Enjoy your day 🎉"
        : filter === "week"
        ? "No tasks this week! You're all caught up 🌟"
        : "No upcoming tasks! You're ahead of schedule 💪";
    }

    if (completedTasks === totalTasks) {
      return filter === "today"
        ? "All done for today! Amazing work 🎊"
        : "All tasks completed! You're crushing it 🏆";
    }

    const taskWord = pendingTasks === 1 ? "task" : "tasks";
    const filterLabel = filter === "today" ? "today" : filter === "week" ? "this week" : "coming up";
    
    return `You've got ${pendingTasks} ${taskWord} ${filterLabel} 💪`;
  };

  const getDueLabel = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isThisWeek(date, { weekStartsOn: 0 })) return format(date, "EEEE");
    return format(date, "MMM dd");
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Daily To-Do 📋</h2>
        <div className="flex gap-2">
          <Button
            variant={filter === "today" ? "default" : "outline"}
            onClick={() => setFilter("today")}
            size="sm"
          >
            Today
          </Button>
          <Button
            variant={filter === "week" ? "default" : "outline"}
            onClick={() => setFilter("week")}
            size="sm"
          >
            This Week
          </Button>
          <Button
            variant={filter === "upcoming" ? "default" : "outline"}
            onClick={() => setFilter("upcoming")}
            size="sm"
          >
            Upcoming
          </Button>
        </div>
      </div>

      {/* Motivational Message */}
      <Card className="p-4 mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <p className="text-center font-medium text-lg">
          {getMotivationalMessage()}
        </p>
        {tasks.length > 0 && tasks.some(t => !t.completed) && (
          <p className="text-center text-sm text-muted-foreground mt-1">
            Let's get it done! 🚀
          </p>
        )}
      </Card>

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {filter === "today" 
              ? "No tasks scheduled for today!"
              : filter === "week"
              ? "No tasks scheduled this week!"
              : "No upcoming tasks!"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md",
                task.completed ? "bg-accent/30 opacity-60" : "bg-card hover:bg-accent/20",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task)}
                className="h-6 w-6"
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{task.emoji || "📝"}</span>
                  <span 
                    className={cn(
                      "font-medium text-lg",
                      task.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {task.task_name}
                  </span>
                </div>
                {task.due_date && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{getDueLabel(task.due_date)}</span>
                  </div>
                )}
              </div>

              {task.completed ? (
                <div className="text-green-600 font-medium flex items-center gap-1">
                  <span>✅</span>
                  <span className="text-sm">Done</span>
                </div>
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Progress Summary */}
      {tasks.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {tasks.filter(t => t.completed).length} of {tasks.length} completed
            </span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-secondary rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all"
                  style={{ width: `${tasks.length ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%` }}
                />
              </div>
              <span className="font-medium text-primary">
                {Math.round(tasks.length ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TodoToday;
