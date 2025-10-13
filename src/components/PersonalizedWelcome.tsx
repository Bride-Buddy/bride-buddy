import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PersonalizedWelcomeProps {
  userId: string;
}

export const PersonalizedWelcome = ({ userId }: PersonalizedWelcomeProps) => {
  const { toast } = useToast();

  useEffect(() => {
    const showPersonalizedWelcome = async () => {
      // Fetch user's personal data
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', userId)
        .single();

      const { data: timeline } = await supabase
        .from('timeline')
        .select('wedding_date')
        .eq('user_id', userId)
        .single();

      const { data: checklist } = await supabase
        .from('checklist')
        .select('completed')
        .eq('user_id', userId);

      const { data: vendors } = await supabase
        .from('vendors')
        .select('amount, paid')
        .eq('user_id', userId);

      // Calculate personalized stats
      const firstName = profile?.full_name?.split(' ')[0] || "Beautiful Bride";
      const completedTasks = checklist?.filter(t => t.completed).length || 0;
      const totalTasks = checklist?.length || 0;
      const totalBudget = vendors?.reduce((sum, v) => sum + (Number(v.amount) || 0), 0) || 0;
      const paidAmount = vendors?.filter(v => v.paid).reduce((sum, v) => sum + (Number(v.amount) || 0), 0) || 0;
      
      let daysUntilWedding = null;
      if (timeline?.wedding_date) {
        daysUntilWedding = Math.ceil(
          (new Date(timeline.wedding_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
      }

      // Get time-based greeting
      const hour = new Date().getHours();
      let greeting = "Hey";
      if (hour < 12) greeting = "Good morning";
      else if (hour < 18) greeting = "Good afternoon";
      else greeting = "Good evening";

      // Create personalized welcome message
      let description = `Your personal wedding planner is ready! ✨`;
      
      if (daysUntilWedding !== null) {
        description += `\n💍 ${daysUntilWedding} days until your big day!`;
      }
      
      if (totalTasks > 0) {
        description += `\n✅ ${completedTasks}/${totalTasks} tasks completed`;
      }
      
      if (totalBudget > 0) {
        const budgetPercent = Math.round((paidAmount / totalBudget) * 100);
        description += `\n💰 ${budgetPercent}% of budget allocated`;
      }

      // Show welcome toast only on first visit of the day
      const lastWelcome = localStorage.getItem('lastWelcome');
      const today = new Date().toDateString();
      
      if (lastWelcome !== today) {
        setTimeout(() => {
          toast({
            title: `${greeting}, ${firstName}! 💕`,
            description: description,
            duration: 6000,
          });
        }, 1000);
        
        localStorage.setItem('lastWelcome', today);
      }
    };

    showPersonalizedWelcome();
  }, [userId, toast]);

  return null;
};
