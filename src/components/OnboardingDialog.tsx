import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface OnboardingDialogProps {
  userId: string;
  userName: string;
}

type OnboardingStep = "engagement" | "wedding" | "relationship" | "tasks" | "complete";

const OnboardingDialog = ({ userId, userName }: OnboardingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<OnboardingStep>("engagement");
  const [engagementDate, setEngagementDate] = useState<Date>();
  const [weddingDate, setWeddingDate] = useState<Date>();
  const [relationshipYears, setRelationshipYears] = useState("");
  const [completedTasks, setCompletedTasks] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    checkOnboardingStatus();
  }, [userId]);

  const checkOnboardingStatus = async () => {
    const { data: timeline } = await supabase
      .from('timeline')
      .select('engagement_date, wedding_date')
      .eq('user_id', userId)
      .single();

    if (!timeline?.engagement_date || !timeline?.wedding_date) {
      setOpen(true);
    }
  };

  const handleNext = async () => {
    try {
      if (step === "engagement") {
        if (!engagementDate) {
          toast({
            title: "Please select a date",
            description: "We need your engagement date to continue",
            variant: "destructive",
          });
          return;
        }
        setStep("wedding");
      } else if (step === "wedding") {
        if (!weddingDate) {
          toast({
            title: "Please select a date",
            description: "We need your wedding date to continue",
            variant: "destructive",
          });
          return;
        }
        setStep("relationship");
      } else if (step === "relationship") {
        if (!relationshipYears) {
          toast({
            title: "Please tell us",
            description: "How long have you been together?",
            variant: "destructive",
          });
          return;
        }
        setStep("tasks");
      } else if (step === "tasks") {
        // Save all data
        await saveOnboardingData();
        setStep("complete");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveOnboardingData = async () => {
    // Update timeline
    const { error: timelineError } = await supabase
      .from('timeline')
      .update({
        engagement_date: engagementDate?.toISOString().split('T')[0],
        wedding_date: weddingDate?.toISOString().split('T')[0],
      })
      .eq('user_id', userId);

    if (timelineError) throw timelineError;

    // Update profile with relationship duration
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ relationship_years: relationshipYears })
      .eq('user_id', userId);

    if (profileError) throw profileError;

    // Add completed tasks to checklist if provided
    if (completedTasks.trim()) {
      const tasks = completedTasks.split('\n').filter(t => t.trim());
      const taskInserts = tasks.map(task => ({
        user_id: userId,
        task_name: task.trim(),
        completed: true,
        emoji: '✅'
      }));

      const { error: checklistError } = await supabase
        .from('checklist')
        .insert(taskInserts);

      if (checklistError) throw checklistError;
    }
  };

  const handleComplete = () => {
    setOpen(false);
    toast({
      title: "Welcome aboard! 🎉",
      description: "Your wedding planning journey starts now. Let's make your day perfect!",
    });
  };

  const getStepContent = () => {
    switch (step) {
      case "engagement":
        return (
          <div className="space-y-4">
            <p className="text-lg">When is your engagement date? 💎</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !engagementDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {engagementDate ? format(engagementDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={engagementDate}
                  onSelect={setEngagementDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        );
      
      case "wedding":
        return (
          <div className="space-y-4">
            <p className="text-lg">When is your wedding date? 💑❤️</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !weddingDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {weddingDate ? format(weddingDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={weddingDate}
                  onSelect={setWeddingDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        );
      
      case "relationship":
        return (
          <div className="space-y-4">
            <Label htmlFor="relationship">
              How long have you and your partner been together?
            </Label>
            <Input
              id="relationship"
              value={relationshipYears}
              onChange={(e) => setRelationshipYears(e.target.value)}
              placeholder="e.g., 3 years, 18 months, etc."
              autoFocus
            />
          </div>
        );
      
      case "tasks":
        return (
          <div className="space-y-4">
            <Label htmlFor="tasks">
              What tasks have you already completed in your planning?
            </Label>
            <p className="text-sm text-muted-foreground">
              Enter each task on a new line (optional - you can skip this)
            </p>
            <textarea
              id="tasks"
              value={completedTasks}
              onChange={(e) => setCompletedTasks(e.target.value)}
              placeholder="Booked venue&#10;Sent save-the-dates&#10;Hired photographer"
              className="w-full min-h-[120px] p-3 border rounded-md resize-none"
              rows={5}
            />
          </div>
        );
      
      case "complete":
        return (
          <div className="space-y-4 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-xl font-bold">All set, {userName}!</p>
            <p className="text-muted-foreground">
              Your personal Bride Buddy account is ready. Everything you add will be saved so we can pick up right where you leave off.
            </p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {step === "complete" ? "Welcome! 💍" : "Let's Get Started"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          {getStepContent()}
        </div>
        {step !== "complete" ? (
          <div className="flex gap-2">
            {step !== "engagement" && (
              <Button
                variant="outline"
                onClick={() => {
                  const steps: OnboardingStep[] = ["engagement", "wedding", "relationship", "tasks"];
                  const currentIndex = steps.indexOf(step);
                  if (currentIndex > 0) {
                    setStep(steps[currentIndex - 1]);
                  }
                }}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
            >
              {step === "tasks" ? "Finish" : "Next"}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleComplete}
            className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
          >
            Start Planning! 🎊
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingDialog;
