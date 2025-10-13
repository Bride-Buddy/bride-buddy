import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Plus, Trash2, DollarSign, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Vendor {
  id: string;
  name: string;
  service: string;
  amount: number | null;
  paid: boolean;
  due_date: string | null;
  notes: string | null;
}

interface VendorTrackerProps {
  userId: string;
}

const COMMON_VENDORS = [
  { service: "Venue", icon: "🏰" },
  { service: "Photographer", icon: "📸" },
  { service: "Videographer", icon: "🎥" },
  { service: "Florist", icon: "💐" },
  { service: "Caterer", icon: "🍽️" },
  { service: "DJ/Band", icon: "🎵" },
  { service: "Cake", icon: "🍰" },
  { service: "Dress/Suit", icon: "👰" },
  { service: "Invitations", icon: "💌" },
  { service: "Transportation", icon: "🚗" },
];

const VendorTracker = ({ userId }: VendorTrackerProps) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: "",
    service: "",
    amount: "",
    due_date: undefined as Date | undefined,
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVendors();
  }, [userId]);

  const loadVendors = async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive",
      });
      return;
    }

    setVendors(data || []);
  };

  const addVendor = async () => {
    if (!newVendor.name.trim() || !newVendor.service.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide vendor name and service",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('vendors')
      .insert({
        user_id: userId,
        name: newVendor.name,
        service: newVendor.service,
        amount: newVendor.amount ? parseFloat(newVendor.amount) : null,
        due_date: newVendor.due_date?.toISOString().split('T')[0],
        notes: newVendor.notes || null,
        paid: false
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add vendor",
        variant: "destructive",
      });
    } else {
      setNewVendor({
        name: "",
        service: "",
        amount: "",
        due_date: undefined,
        notes: ""
      });
      setShowAddDialog(false);
      loadVendors();
      toast({
        title: "Vendor added! 🎉",
        description: `${newVendor.name} has been added to your vendor list`,
      });
    }
    setLoading(false);
  };

  const togglePaid = async (vendor: Vendor) => {
    const { error } = await supabase
      .from('vendors')
      .update({ paid: !vendor.paid })
      .eq('id', vendor.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
      return;
    }

    if (!vendor.paid) {
      const remainingBudget = totalBudget - (paidAmount + (vendor.amount || 0));
      toast({
        title: `💰 Payment recorded for ${vendor.name}!`,
        description: `Great job! You're crushing this budget management! ${remainingBudget > 0 ? `$${remainingBudget.toLocaleString()} remaining` : 'All paid up! 🎉'}`,
        duration: 4000,
      });
    } else {
      toast({
        title: "Payment unmarked",
        description: "Status updated ✨",
      });
    }

    loadVendors();
  };

  const deleteVendor = async (vendorId: string) => {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', vendorId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete vendor",
        variant: "destructive",
      });
    } else {
      loadVendors();
    }
  };

  const totalBudget = vendors.reduce((sum, v) => sum + (v.amount || 0), 0);
  const paidAmount = vendors.filter(v => v.paid).reduce((sum, v) => sum + (v.amount || 0), 0);
  const unpaidVendors = vendors.filter(v => !v.paid);
  const nextPayment = unpaidVendors.sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  })[0];

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Vendor Tracker 📋</h2>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Vendor Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Elegant Events Co."
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="service">Service *</Label>
                  <Input
                    id="service"
                    placeholder="e.g., Photography"
                    value={newVendor.service}
                    onChange={(e) => setNewVendor({ ...newVendor, service: e.target.value })}
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {COMMON_VENDORS.map(({ service, icon }) => (
                      <Button
                        key={service}
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewVendor({ ...newVendor, service })}
                        className="text-xs h-7"
                      >
                        {icon} {service}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={newVendor.amount}
                    onChange={(e) => setNewVendor({ ...newVendor, amount: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newVendor.due_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newVendor.due_date ? format(newVendor.due_date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newVendor.due_date}
                        onSelect={(date) => setNewVendor({ ...newVendor, due_date: date })}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Contact info, preferences, etc."
                    value={newVendor.notes}
                    onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addVendor}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-primary to-primary-glow"
                >
                  Add Vendor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-accent/50">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="text-primary" />
              <p className="text-sm text-muted-foreground">Total Budget</p>
            </div>
            <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
          </Card>
          
          <Card className="p-4 bg-green-500/10">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-green-600" />
              <p className="text-sm text-muted-foreground">Paid</p>
            </div>
            <p className="text-2xl font-bold text-green-600">${paidAmount.toLocaleString()}</p>
          </Card>
          
          <Card className="p-4 bg-orange-500/10">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="text-orange-600" />
              <p className="text-sm text-muted-foreground">Next Payment</p>
            </div>
            {nextPayment ? (
              <>
                <p className="text-xl font-bold text-orange-600">${nextPayment.amount?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {nextPayment.name} - {nextPayment.due_date ? format(new Date(nextPayment.due_date), 'MMM dd') : 'No date'}
                </p>
              </>
            ) : (
              <p className="text-sm">All paid! 🎉</p>
            )}
          </Card>
        </div>

        {/* Vendors Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Vendor Name</th>
                <th className="text-left py-3 px-2">Service</th>
                <th className="text-right py-3 px-2">Amount</th>
                <th className="text-center py-3 px-2">Paid?</th>
                <th className="text-center py-3 px-2">Due Date</th>
                <th className="text-left py-3 px-2">Notes</th>
                <th className="text-center py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No vendors added yet. Click "Add Vendor" to get started!
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr 
                    key={vendor.id} 
                    className={cn(
                      "border-b hover:bg-accent/50 transition-colors",
                      vendor.paid && "opacity-60"
                    )}
                  >
                    <td className="py-3 px-2 font-medium">{vendor.name}</td>
                    <td className="py-3 px-2">{vendor.service}</td>
                    <td className="py-3 px-2 text-right font-bold">
                      ${vendor.amount?.toLocaleString() || 0}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Checkbox
                        checked={vendor.paid}
                        onCheckedChange={() => togglePaid(vendor)}
                      />
                    </td>
                    <td className="py-3 px-2 text-center text-sm">
                      {vendor.due_date ? format(new Date(vendor.due_date), "MM/dd/yyyy") : "-"}
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground max-w-xs truncate">
                      {vendor.notes || "-"}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteVendor(vendor.id)}
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

        <div className="mt-4 flex justify-between text-sm text-muted-foreground">
          <span>{vendors.filter(v => v.paid).length} of {vendors.length} vendors paid</span>
          <span>Remaining: ${(totalBudget - paidAmount).toLocaleString()}</span>
        </div>
      </Card>
    </div>
  );
};

export default VendorTracker;
