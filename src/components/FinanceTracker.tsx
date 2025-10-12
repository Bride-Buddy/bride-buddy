import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, TrendingUp, TrendingDown, Calendar, PieChart, Edit, CheckCircle, AlertCircle } from "lucide-react";
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

interface FinanceTrackerProps {
  userId: string;
}

interface CategorySpending {
  category: string;
  amount: number;
  count: number;
  icon: string;
}

const FinanceTracker = ({ userId }: FinanceTrackerProps) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
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
        description: "Failed to load vendor data",
        variant: "destructive",
      });
      return;
    }

    setVendors(data || []);
  };

  const updateVendorAmount = async () => {
    if (!editingVendor) return;

    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('vendors')
      .update({ amount })
      .eq('id', editingVendor.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update amount",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Amount updated! 💰",
        description: `${editingVendor.name} amount updated to $${amount.toLocaleString()}`,
      });
      setShowEditDialog(false);
      setEditingVendor(null);
      setEditAmount("");
      loadVendors();
    }
  };

  const openEditDialog = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setEditAmount(vendor.amount?.toString() || "");
    setShowEditDialog(true);
  };

  // Calculate totals
  const totalBudget = vendors.reduce((sum, v) => sum + (v.amount || 0), 0);
  const paidAmount = vendors.filter(v => v.paid).reduce((sum, v) => sum + (v.amount || 0), 0);
  const unpaidAmount = totalBudget - paidAmount;
  const paidCount = vendors.filter(v => v.paid).length;
  const unpaidCount = vendors.length - paidCount;

  // Get spending by category
  const categorySpending: CategorySpending[] = vendors.reduce((acc: CategorySpending[], vendor) => {
    const existing = acc.find(c => c.category === vendor.service);
    const amount = vendor.amount || 0;
    
    if (existing) {
      existing.amount += amount;
      existing.count += 1;
    } else {
      // Map service to emoji
      const iconMap: { [key: string]: string } = {
        'Venue': '🏰',
        'Photographer': '📸',
        'Videographer': '🎥',
        'Florist': '💐',
        'Caterer': '🍽️',
        'DJ/Band': '🎵',
        'Cake': '🍰',
        'Dress/Suit': '👰',
        'Invitations': '💌',
        'Transportation': '🚗',
      };
      
      acc.push({
        category: vendor.service,
        amount,
        count: 1,
        icon: iconMap[vendor.service] || '💼'
      });
    }
    return acc;
  }, []).sort((a, b) => b.amount - a.amount);

  // Get upcoming payments
  const upcomingPayments = vendors
    .filter(v => !v.paid && v.due_date)
    .sort((a, b) => {
      if (!a.due_date || !b.due_date) return 0;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <DollarSign className="text-primary" />
          </div>
          <p className="text-3xl font-bold">${totalBudget.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{vendors.length} vendors</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Paid</p>
            <CheckCircle className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">${paidAmount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{paidCount} payments made</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Unpaid</p>
            <AlertCircle className="text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-600">${unpaidAmount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{unpaidCount} pending</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Progress</p>
            <TrendingUp className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {totalBudget > 0 ? Math.round((paidAmount / totalBudget) * 100) : 0}%
          </p>
          <div className="w-full bg-secondary rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${totalBudget > 0 ? (paidAmount / totalBudget) * 100 : 0}%` }}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="text-primary" />
            <h3 className="text-xl font-bold">Spending by Category</h3>
          </div>
          {categorySpending.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No spending data yet. Add vendors to track your budget!
            </p>
          ) : (
            <div className="space-y-3">
              {categorySpending.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <p className="font-medium">{category.category}</p>
                        <p className="text-xs text-muted-foreground">{category.count} vendor{category.count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${category.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {totalBudget > 0 ? Math.round((category.amount / totalBudget) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${totalBudget > 0 ? (category.amount / totalBudget) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Payments */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-primary" />
            <h3 className="text-xl font-bold">Upcoming Payments</h3>
          </div>
          {upcomingPayments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No upcoming payments! All vendors are paid 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingPayments.map((vendor) => (
                <div 
                  key={vendor.id}
                  className="p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{vendor.name}</p>
                      <p className="text-sm text-muted-foreground">{vendor.service}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">${vendor.amount?.toLocaleString() || 0}</p>
                      {vendor.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Due {format(new Date(vendor.due_date), 'MMM dd')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* All Vendor Payments */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">All Vendor Payments</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Vendor</th>
                <th className="text-left py-3 px-2">Service</th>
                <th className="text-right py-3 px-2">Amount</th>
                <th className="text-center py-3 px-2">Status</th>
                <th className="text-center py-3 px-2">Due Date</th>
                <th className="text-center py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No vendors added yet. Add vendors to start tracking your budget!
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
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        vendor.paid 
                          ? "bg-green-500/20 text-green-700" 
                          : "bg-orange-500/20 text-orange-700"
                      )}>
                        {vendor.paid ? "✅ Paid" : "⏳ Unpaid"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-sm">
                      {vendor.due_date ? format(new Date(vendor.due_date), "MMM dd, yyyy") : "-"}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(vendor)}
                        className="hover:bg-primary/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {vendors.length > 0 && (
              <tfoot className="border-t-2">
                <tr className="font-bold">
                  <td colSpan={2} className="py-3 px-2">Total</td>
                  <td className="py-3 px-2 text-right">${totalBudget.toLocaleString()}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>

      {/* Edit Amount Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Amount</DialogTitle>
          </DialogHeader>
          {editingVendor && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Vendor: {editingVendor.name}</p>
                <p className="text-sm text-muted-foreground">Service: {editingVendor.service}</p>
              </div>
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={updateVendorAmount}
                  className="flex-1 bg-gradient-to-r from-primary to-primary-glow"
                >
                  Update Amount
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceTracker;
