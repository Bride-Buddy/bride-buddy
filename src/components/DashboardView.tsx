import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, DollarSign, Users, Car, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import Checklist from "./Checklist";
import VendorTracker from "./VendorTracker";
import WeddingTimeline from "./WeddingTimeline";

interface DashboardViewProps {
  userId: string;
  view: "overview" | "todo" | "finance" | "vendors" | "timeline" | "checklist" | null;
  onViewChange: (view: "overview" | "todo" | "finance" | "vendors" | "timeline" | "checklist" | null) => void;
}

interface ChecklistItem {
  id: string;
  task_name: string;
  emoji: string | null;
  due_date: string | null;
  completed: boolean;
}

interface Vendor {
  id: string;
  name: string;
  service: string;
  amount: number | null;
  paid: boolean;
  due_date: string | null;
  notes: string | null;
}

interface Timeline {
  engagement_date: string | null;
  wedding_date: string | null;
  car_position: number;
  completed_tasks: number;
}

const DashboardView = ({ userId, view, onViewChange }: DashboardViewProps) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (view) {
      loadData();
    }
  }, [view, userId]);

  const loadData = async () => {
    setLoading(true);
    
    // Load checklist
    const { data: checklistData } = await supabase
      .from('checklist')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });
    
    if (checklistData) setChecklist(checklistData);

    // Load vendors
    const { data: vendorsData } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });
    
    if (vendorsData) setVendors(vendorsData);

    // Load timeline
    const { data: timelineData } = await supabase
      .from('timeline')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (timelineData) setTimeline(timelineData);

    setLoading(false);
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    await supabase
      .from('checklist')
      .update({ completed: !completed })
      .eq('id', taskId);
    
    loadData();
  };

  if (!view) return null;

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      </Card>
    );
  }

  const totalBudget = vendors.reduce((sum, v) => sum + (v.amount || 0), 0);
  const paidAmount = vendors.filter(v => v.paid).reduce((sum, v) => sum + (v.amount || 0), 0);
  const todoToday = checklist.filter(item => 
    !item.completed && 
    item.due_date && 
    new Date(item.due_date).toDateString() === new Date().toDateString()
  );

  const renderOverview = () => (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CheckCircle2 className="text-primary" />
          Checklist Summary
        </h3>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {checklist.filter(t => t.completed).length} of {checklist.length} tasks completed
          </p>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${checklist.length ? (checklist.filter(t => t.completed).length / checklist.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <DollarSign className="text-primary" />
          Budget Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Budget:</span>
            <span className="font-bold">${totalBudget.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Paid:</span>
            <span className="text-green-600">${paidAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Remaining:</span>
            <span className="text-orange-600">${(totalBudget - paidAmount).toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTodoToday = () => (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Calendar className="text-primary" />
        To-Do Today
      </h3>
      {todoToday.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No tasks due today! Enjoy your day 🎉
        </p>
      ) : (
        <div className="space-y-3">
          {todoToday.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50">
              <Checkbox 
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id, task.completed)}
              />
              <span className="flex-1">{task.emoji} {task.task_name}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  const renderFinanceTracker = () => (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <DollarSign className="text-primary" />
        Finance Tracker
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-accent/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-green-500/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Paid</p>
            <p className="text-2xl font-bold text-green-600">${paidAmount.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-orange-500/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Unpaid</p>
            <p className="text-2xl font-bold text-orange-600">${(totalBudget - paidAmount).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">{vendor.name}</p>
                <p className="text-sm text-muted-foreground">{vendor.service}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">${vendor.amount?.toLocaleString() || 0}</p>
                <p className={`text-sm ${vendor.paid ? 'text-green-600' : 'text-orange-600'}`}>
                  {vendor.paid ? '✓ Paid' : 'Unpaid'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  const renderVendorTracker = () => (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Users className="text-primary" />
        Vendor Tracker
      </h3>
      <div className="space-y-3">
        {vendors.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No vendors added yet. Start by adding your first vendor!
          </p>
        ) : (
          vendors.map((vendor) => (
            <div key={vendor.id} className="p-4 rounded-lg border space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{vendor.name}</p>
                  <p className="text-sm text-muted-foreground">{vendor.service}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  vendor.paid ? 'bg-green-500/20 text-green-700' : 'bg-orange-500/20 text-orange-700'
                }`}>
                  {vendor.paid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Amount: ${vendor.amount?.toLocaleString() || 0}</span>
                {vendor.due_date && (
                  <span>Due: {format(new Date(vendor.due_date), 'MMM dd, yyyy')}</span>
                )}
              </div>
              {vendor.notes && (
                <p className="text-sm text-muted-foreground mt-2">{vendor.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );

  const renderTimeline = () => {
    if (!timeline) return null;

    const daysUntilWedding = timeline.wedding_date 
      ? Math.ceil((new Date(timeline.wedding_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return (
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Car className="text-primary" />
          Wedding Timeline 🚗💍
        </h3>
        <div className="space-y-6">
          {timeline.engagement_date && (
            <div className="flex items-center gap-3">
              <span className="text-3xl">💎</span>
              <div>
                <p className="font-medium">Engagement Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(timeline.engagement_date), 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
          )}
          
          {timeline.wedding_date && (
            <div className="flex items-center gap-3">
              <span className="text-3xl">💑❤️</span>
              <div>
                <p className="font-medium">Wedding Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(timeline.wedding_date), 'MMMM dd, yyyy')}
                </p>
                <p className="text-sm font-bold text-primary">
                  {daysUntilWedding > 0 ? `${daysUntilWedding} days to go!` : 'Today is the day! 🎉'}
                </p>
              </div>
            </div>
          )}

          <div className="bg-accent/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Progress</p>
            <div className="flex items-center gap-3">
              <Car className="text-2xl" />
              <div className="flex-1">
                <div className="w-full bg-secondary rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary-glow h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((timeline.car_position || 0) * 10, 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-2xl">💍</span>
            </div>
            <p className="text-sm text-center mt-2">
              {timeline.completed_tasks || 0} tasks completed
            </p>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap mb-4">
        <Button
          variant={view === "overview" ? "default" : "outline"}
          onClick={() => onViewChange("overview")}
          size="sm"
        >
          View Dashboard
        </Button>
        <Button
          variant={view === "checklist" ? "default" : "outline"}
          onClick={() => onViewChange("checklist")}
          size="sm"
        >
          Full Checklist
        </Button>
        <Button
          variant={view === "todo" ? "default" : "outline"}
          onClick={() => onViewChange("todo")}
          size="sm"
        >
          To-Do Today
        </Button>
        <Button
          variant={view === "finance" ? "default" : "outline"}
          onClick={() => onViewChange("finance")}
          size="sm"
        >
          Finance Tracker
        </Button>
        <Button
          variant={view === "vendors" ? "default" : "outline"}
          onClick={() => onViewChange("vendors")}
          size="sm"
        >
          Vendor Tracker
        </Button>
        <Button
          variant={view === "timeline" ? "default" : "outline"}
          onClick={() => onViewChange("timeline")}
          size="sm"
        >
          Wedding Timeline
        </Button>
      </div>

      {view === "overview" && renderOverview()}
      {view === "checklist" && <Checklist userId={userId} />}
      {view === "todo" && renderTodoToday()}
      {view === "finance" && renderFinanceTracker()}
      {view === "vendors" && <VendorTracker userId={userId} />}
      {view === "timeline" && <WeddingTimeline userId={userId} />}
    </div>
  );
};

export default DashboardView;
