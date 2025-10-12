import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ChecklistItem {
  id: string;
  task_name: string;
  emoji: string | null;
  due_date: string | null;
  completed: boolean;
}

interface ChecklistProps {
  userId: string;
}

const COMMON_TASK_EMOJIS = [
  { task: "Book Venue", emoji: "🏰" },
  { task: "Choose Dress", emoji: "👰" },
  { task: "Send Invites", emoji: "💌" },
  { task: "Book Photographer", emoji: "📸" },
  { task: "Taste Cake", emoji: "🍰" },
  { task: "Book Florist", emoji: "💐" },
  { task: "Choose Menu", emoji: "🍽️" },
  { task: "Book DJ/Band", emoji: "🎵" },
  { task: "Order Rings", emoji: "💍" },
  { task: "Book Hotel", emoji: "🏨" },
];

const Checklist = ({ userId }: ChecklistProps) => {
  const [tasks, setTasks] = useState<ChecklistItem[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newEmoji, setNewEmoji] = useState("✅");
  const [newDueDate, setNewDueDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, [userId]);

  const loadTasks = async () => {
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
      return;
    }

    setTasks(data || []);
  };

  const updateTimeline = async () => {
    // Get current timeline
    const { data: timeline } = await supabase
      .from('timeline')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (timeline) {
      const completedCount = tasks.filter(t => t.completed).length + 1; // +1 for the task we just completed
      const newCarPosition = Math.min(Math.floor(completedCount / 2), 10); // Move car based on completed tasks

      await supabase
        .from('timeline')
        .update({
          completed_tasks: completedCount,
          car_position: newCarPosition
        })
        .eq('user_id', userId);
    }
  };

  const toggleTask = async (task: ChecklistItem) => {
    const newCompletedState = !task.completed;
    
    const { error } = await supabase
      .from('checklist')
      .update({ completed: newCompletedState })
      .eq('id', task.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
      return;
    }

    if (newCompletedState) {
      await updateTimeline();
      
      toast({
        title: `You just completed '${task.task_name}' ${task.emoji || '✅'}`,
        description: "Your timeline is rolling! Keep moving toward the big day 💑❤️",
        duration: 4000,
      });
    }

    loadTasks();
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from('checklist')
      .insert({
        user_id: userId,
        task_name: newTask,
        emoji: newEmoji,
        due_date: newDueDate?.toISOString().split('T')[0],
        completed: false
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      });
    } else {
      setNewTask("");
      setNewEmoji("✅");
      setNewDueDate(undefined);
      loadTasks();
    }
    setLoading(false);
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('checklist')
      .delete()
      .eq('id', taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    } else {
      loadTasks();
    }
  };

  const addCommonTask = async (taskName: string, emoji: string) => {
    const { error } = await supabase
      .from('checklist')
      .insert({
        user_id: userId,
        task_name: taskName,
        emoji: emoji,
        completed: false
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      });
    } else {
      loadTasks();
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Wedding Checklist 📋</h2>
        
        {/* Add New Task */}
        <div className="mb-6 p-4 bg-accent/30 rounded-lg space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Task name"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              className="flex-1"
            />
            <Input
              placeholder="📝"
              value={newEmoji}
              onChange={(e) => setNewEmoji(e.target.value)}
              className="w-20 text-center"
              maxLength={2}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn(!newDueDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newDueDate ? format(newDueDate, "MM/dd") : "Due"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newDueDate}
                  onSelect={setNewDueDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Button onClick={addTask} disabled={loading || !newTask.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Common Tasks Quick Add */}
        {tasks.length === 0 && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">Quick add common tasks:</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_TASK_EMOJIS.map(({ task, emoji }) => (
                <Button
                  key={task}
                  variant="outline"
                  size="sm"
                  onClick={() => addCommonTask(task, emoji)}
                  className="text-sm"
                >
                  {emoji} {task}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Task</th>
                <th className="text-center py-3 px-2">Emoji</th>
                <th className="text-center py-3 px-2">Status</th>
                <th className="text-center py-3 px-2">Due Date</th>
                <th className="text-center py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    No tasks yet. Add your first task above or use quick add buttons!
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr 
                    key={task.id} 
                    className={cn(
                      "border-b hover:bg-accent/50 transition-colors",
                      task.completed && "opacity-60"
                    )}
                  >
                    <td className="py-3 px-2">
                      <span className={task.completed ? "line-through" : ""}>
                        {task.task_name}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2 text-2xl">
                      {task.emoji || "✅"}
                    </td>
                    <td className="text-center py-3 px-2">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task)}
                      />
                    </td>
                    <td className="text-center py-3 px-2 text-sm">
                      {task.due_date ? format(new Date(task.due_date), "MM/dd") : "-"}
                    </td>
                    <td className="text-center py-3 px-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground text-center">
          {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
        </div>
      </Card>
    </div>
  );
};

export default Checklist;
