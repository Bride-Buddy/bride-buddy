import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, DollarSign, TrendingUp, ListChecks, Users, 
  ArrowLeft, Plus, Trash2, Edit2, Check, X 
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { format } from "date-fns";

interface PlannerWorkspaceProps {
  userId: string;
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

interface ChecklistItem {
  id: string;
  task_name: string;
  emoji: string | null;
  due_date: string | null;
  completed: boolean;
}

const PlannerWorkspace: React.FC<PlannerWorkspaceProps> = ({ userId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [timeline, setTimeline] = useState<any>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  // Dialog states
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  
  // Form states
  const [vendorForm, setVendorForm] = useState({ name: "", service: "", amount: "", due_date: "", notes: "" });
  const [taskForm, setTaskForm] = useState({ task_name: "", emoji: "", due_date: "" });

  useEffect(() => {
    loadAllData();
  }, [userId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [profileRes, timelineRes, checklistRes, vendorsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).single(),
        supabase.from("timeline").select("*").eq("user_id", userId).single(),
        supabase.from("checklist").select("*").eq("user_id", userId).order("due_date", { ascending: true }),
        supabase.from("vendors").select("*").eq("user_id", userId).order("due_date", { ascending: true })
      ]);

      setProfile(profileRes.data);
      setTimeline(timelineRes.data);
      setChecklist(checklistRes.data || []);
      setVendors(vendorsRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({ title: "Error", description: "Failed to load planning data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Calculations
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

  const totalBudget = vendors.reduce((sum, v) => sum + (Number(v.amount) || 0), 0);
  const spent = vendors.filter((v) => v.paid).reduce((sum, v) => sum + (Number(v.amount) || 0), 0);
  const daysUntilWedding = getDaysUntilWedding();
  const timelineProgress = getTimelineProgress();
  const todaysFocus = checklist.filter((task) => !task.completed).slice(0, 4);
  const userName = profile?.full_name?.split(" ")[0] || "Beautiful Bride";

  // Vendor actions
  const addVendor = async () => {
    if (!vendorForm.name || !vendorForm.service) {
      toast({ title: "Error", description: "Please fill in vendor name and service", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("vendors").insert({
      user_id: userId,
      name: vendorForm.name,
      service: vendorForm.service,
      amount: vendorForm.amount ? Number(vendorForm.amount) : null,
      due_date: vendorForm.due_date || null,
      notes: vendorForm.notes || null,
      paid: false
    });

    if (error) {
      toast({ title: "Error", description: "Failed to add vendor", variant: "destructive" });
    } else {
      toast({ title: "Success!", description: `${vendorForm.name} added to your vendors` });
      setShowVendorDialog(false);
      setVendorForm({ name: "", service: "", amount: "", due_date: "", notes: "" });
      loadAllData();
    }
  };

  const toggleVendorPaid = async (vendorId: string, currentPaid: boolean) => {
    const { error } = await supabase.from("vendors").update({ paid: !currentPaid }).eq("id", vendorId);
    
    if (error) {
      toast({ title: "Error", description: "Failed to update payment status", variant: "destructive" });
    } else {
      loadAllData();
    }
  };

  const deleteVendor = async (vendorId: string) => {
    const { error } = await supabase.from("vendors").delete().eq("id", vendorId);
    
    if (error) {
      toast({ title: "Error", description: "Failed to delete vendor", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Vendor removed" });
      loadAllData();
    }
  };

  // Checklist actions
  const addTask = async () => {
    if (!taskForm.task_name) {
      toast({ title: "Error", description: "Please enter a task name", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("checklist").insert({
      user_id: userId,
      task_name: taskForm.task_name,
      emoji: taskForm.emoji || null,
      due_date: taskForm.due_date || null,
      completed: false
    });

    if (error) {
      toast({ title: "Error", description: "Failed to add task", variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Task added to checklist" });
      setShowTaskDialog(false);
      setTaskForm({ task_name: "", emoji: "", due_date: "" });
      loadAllData();
    }
  };

  const toggleTask = async (taskId: string, currentCompleted: boolean) => {
    const { error } = await supabase.from("checklist").update({ completed: !currentCompleted }).eq("id", taskId);
    
    if (error) {
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
    } else {
      loadAllData();
    }
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from("checklist").delete().eq("id", taskId);
    
    if (error) {
      toast({ title: "Error", description: "Failed to delete task", variant: "destructive" });
    } else {
      loadAllData();
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Categorize spending
  const categorySpending = vendors.reduce((acc, v) => {
    const category = v.service;
    if (!acc[category]) acc[category] = { total: 0, paid: 0 };
    acc[category].total += Number(v.amount) || 0;
    if (v.paid) acc[category].paid += Number(v.amount) || 0;
    return acc;
  }, {} as Record<string, { total: number; paid: number }>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-300 to-blue-300 px-4 py-4 flex items-center justify-between shadow-md">
        <button
          onClick={() => navigate(ROUTES.CHAT)}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
        >
          <ArrowLeft className="text-white" size={20} />
        </button>
        <span className="text-white font-semibold text-lg">Wedding Planner</span>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = ROUTES.AUTH;
          }}
          className="px-3 py-1.5 bg-red-400 hover:bg-red-500 text-white text-sm rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Checkbox 
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id, task.completed)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{task.emoji} {task.task_name}</p>
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

        {/* Tabbed Content */}
        <Tabs defaultValue="vendors" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
          </TabsList>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="mt-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="text-purple-400" />
                  Vendor Tracker
                </h3>
                <Button onClick={() => setShowVendorDialog(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Add Vendor
                </Button>
              </div>
              
              {vendors.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No vendors added yet</p>
                  <Button onClick={() => setShowVendorDialog(true)}>Add Your First Vendor</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {vendors.map((vendor) => (
                    <div key={vendor.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{vendor.name}</h4>
                          <p className="text-sm text-gray-600">{vendor.service}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          vendor.paid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {vendor.paid ? '✓ Paid' : 'Unpaid'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 text-sm">
                        <span className="font-medium">${vendor.amount?.toLocaleString() || 0}</span>
                        {vendor.due_date && (
                          <span className="text-gray-500">Due: {format(new Date(vendor.due_date), 'MMM dd, yyyy')}</span>
                        )}
                      </div>
                      
                      {vendor.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">{vendor.notes}</p>
                      )}
                      
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toggleVendorPaid(vendor.id, vendor.paid)}
                        >
                          {vendor.paid ? <X className="h-4 w-4 mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                          {vendor.paid ? 'Mark Unpaid' : 'Mark Paid'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => deleteVendor(vendor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Finance Tab */}
          <TabsContent value="finance" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <DollarSign className="text-purple-400" />
                Finance Tracker
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Total Budget</p>
                  <p className="text-2xl font-bold text-purple-400">${totalBudget.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Paid</p>
                  <p className="text-2xl font-bold text-green-600">${spent.toLocaleString()}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Remaining</p>
                  <p className="text-2xl font-bold text-orange-600">${(totalBudget - spent).toLocaleString()}</p>
                </div>
              </div>

              <div className="mb-6">
                <Progress value={(spent / totalBudget) * 100} className="h-3" />
                <p className="text-sm text-gray-600 mt-2 text-center">
                  {Math.round((spent / totalBudget) * 100)}% of budget used
                </p>
              </div>

              {Object.keys(categorySpending).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-4">Spending by Category</h4>
                  <div className="space-y-3">
                    {Object.entries(categorySpending).map(([category, data]) => (
                      <div key={category} className="border-b pb-3">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{category}</span>
                          <span className="text-sm text-gray-600">
                            ${data.paid.toLocaleString()} / ${data.total.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={(data.paid / data.total) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="mt-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <ListChecks className="text-purple-400" />
                  Wedding Checklist
                </h3>
                <Button onClick={() => setShowTaskDialog(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </div>
              
              {checklist.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No tasks added yet</p>
                  <Button onClick={() => setShowTaskDialog(true)}>Add Your First Task</Button>
                </div>
              ) : (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    {checklist.filter(t => t.completed).length} of {checklist.length} tasks completed
                  </div>
                  <div className="space-y-2">
                    {checklist.map((task) => (
                      <div 
                        key={task.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          task.completed ? 'bg-gray-50' : 'bg-white'
                        }`}
                      >
                        <Checkbox 
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id, task.completed)}
                        />
                        <div className="flex-1">
                          <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                            {task.emoji} {task.task_name}
                          </p>
                          {task.due_date && (
                            <p className="text-sm text-gray-500">
                              Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Vendor Dialog */}
      <Dialog open={showVendorDialog} onOpenChange={setShowVendorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="vendor-name">Vendor Name *</Label>
              <Input 
                id="vendor-name"
                value={vendorForm.name}
                onChange={(e) => setVendorForm({...vendorForm, name: e.target.value})}
                placeholder="e.g., Sarah's Photography"
              />
            </div>
            <div>
              <Label htmlFor="vendor-service">Service *</Label>
              <Input 
                id="vendor-service"
                value={vendorForm.service}
                onChange={(e) => setVendorForm({...vendorForm, service: e.target.value})}
                placeholder="e.g., Photography"
              />
            </div>
            <div>
              <Label htmlFor="vendor-amount">Amount</Label>
              <Input 
                id="vendor-amount"
                type="number"
                value={vendorForm.amount}
                onChange={(e) => setVendorForm({...vendorForm, amount: e.target.value})}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="vendor-due">Due Date</Label>
              <Input 
                id="vendor-due"
                type="date"
                value={vendorForm.due_date}
                onChange={(e) => setVendorForm({...vendorForm, due_date: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="vendor-notes">Notes</Label>
              <Textarea 
                id="vendor-notes"
                value={vendorForm.notes}
                onChange={(e) => setVendorForm({...vendorForm, notes: e.target.value})}
                placeholder="Additional notes..."
              />
            </div>
            <Button onClick={addVendor} className="w-full">Add Vendor</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-name">Task Name *</Label>
              <Input 
                id="task-name"
                value={taskForm.task_name}
                onChange={(e) => setTaskForm({...taskForm, task_name: e.target.value})}
                placeholder="e.g., Book venue"
              />
            </div>
            <div>
              <Label htmlFor="task-emoji">Emoji</Label>
              <Input 
                id="task-emoji"
                value={taskForm.emoji}
                onChange={(e) => setTaskForm({...taskForm, emoji: e.target.value})}
                placeholder="💍"
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="task-due">Due Date</Label>
              <Input 
                id="task-due"
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({...taskForm, due_date: e.target.value})}
              />
            </div>
            <Button onClick={addTask} className="w-full">Add Task</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlannerWorkspace;