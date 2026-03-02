import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveBlackoutService, type LeaveBlackoutPeriod } from "@/services/leave-blackout.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function LeaveBlackoutPeriodsTable() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LeaveBlackoutPeriod | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    scope: "all" as "all" | "department" | "position" | "employee",
    is_active: true,
  });

  const { data: blackoutPeriods, isLoading } = useQuery({
    queryKey: ["leave-blackout-periods"],
    queryFn: () => leaveBlackoutService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: leaveBlackoutService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-blackout-periods"] });
      toast.success("Blackout period created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to create blackout period");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeaveBlackoutPeriod> }) =>
      leaveBlackoutService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-blackout-periods"] });
      toast.success("Blackout period updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to update blackout period");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: leaveBlackoutService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-blackout-periods"] });
      toast.success("Blackout period deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete blackout period");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      scope: "all",
      is_active: true,
    });
    setEditingItem(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (item: LeaveBlackoutPeriod) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      start_date: item.start_date,
      end_date: item.end_date,
      scope: item.scope,
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this blackout period?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading blackout periods...</div>;
  }

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Leave Blackout Periods</h3>
              <p className="text-sm text-muted-foreground">
                Define periods when leave requests are not allowed
              </p>
            </div>
            <Button onClick={handleAdd}>Add Blackout Period</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blackoutPeriods && blackoutPeriods.length > 0 ? (
                blackoutPeriods.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(item.start_date).toLocaleDateString()} -{" "}
                      {new Date(item.end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="capitalize">{item.scope}</TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No blackout periods found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Blackout Period" : "Add Blackout Period"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Year-End Holiday Blackout"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Scope</label>
              <Select
                value={formData.scope}
                onValueChange={(value) => {
                  if (value === null) {
                    return;
                  }
                  setFormData({ ...formData, scope: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="department">By Department</SelectItem>
                  <SelectItem value="position">By Position</SelectItem>
                  <SelectItem value="employee">Specific Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending || !formData.name.trim()}
            >
              {editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
