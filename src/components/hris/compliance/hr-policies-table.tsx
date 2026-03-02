import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hrPolicyService, type HrPolicy } from "@/services/hr-policy.service";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  active: "bg-green-100 text-green-800",
  archived: "bg-slate-100 text-slate-800",
  superseded: "bg-orange-100 text-orange-800",
};

const categoryOptions = [
  { value: "leave", label: "Leave" },
  { value: "attendance", label: "Attendance" },
  { value: "discipline", label: "Discipline" },
  { value: "compensation", label: "Compensation" },
  { value: "payroll", label: "Payroll" },
  { value: "benefits", label: "Benefits" },
  { value: "recruitment", label: "Recruitment" },
  { value: "performance", label: "Performance" },
  { value: "training", label: "Training" },
  { value: "exit", label: "Exit" },
  { value: "compliance", label: "Compliance" },
  { value: "general", label: "General" },
];

export function HrPoliciesTable() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HrPolicy | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    policy_category: "general" as HrPolicy["policy_category"],
    policy_content: "",
    effective_date: "",
    review_cycle_months: 12,
    requires_acknowledgment: false,
  });

  const { data: policiesData, isLoading } = useQuery({
    queryKey: ["hr-policies"],
    queryFn: () => hrPolicyService.getAll({ per_page: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: hrPolicyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-policies"] });
      toast.success("Policy created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to create policy");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HrPolicy> }) =>
      hrPolicyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-policies"] });
      toast.success("Policy updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to update policy");
    },
  });

  const approveMutation = useMutation({
    mutationFn: hrPolicyService.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-policies"] });
      toast.success("Policy approved and activated");
    },
    onError: () => {
      toast.error("Failed to approve policy");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: hrPolicyService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-policies"] });
      toast.success("Policy deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete policy");
    },
  });

  const scheduleReviewMutation = useMutation({
    mutationFn: hrPolicyService.scheduleReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-policies"] });
      toast.success("Policy review scheduled");
    },
    onError: () => {
      toast.error("Failed to schedule review");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      policy_category: "general",
      policy_content: "",
      effective_date: "",
      review_cycle_months: 12,
      requires_acknowledgment: false,
    });
    setEditingItem(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (item: HrPolicy) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      policy_category: item.policy_category,
      policy_content: item.policy_content || "",
      effective_date: item.effective_date || "",
      review_cycle_months: item.review_cycle_months || 12,
      requires_acknowledgment: item.requires_acknowledgment,
    });
    setIsDialogOpen(true);
  };

  const handleApprove = (id: string) => {
    if (confirm("Approve and activate this policy?")) {
      approveMutation.mutate(id);
    }
  };

  const handleScheduleReview = (id: string) => {
    if (confirm("Schedule a review for this policy?")) {
      scheduleReviewMutation.mutate(id);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this policy?")) {
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
    return <div className="p-4 text-center">Loading HR policies...</div>;
  }

  const policies = policiesData?.data || [];

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">HR Policies</h3>
              <p className="text-sm text-muted-foreground">
                Manage company HR policies and procedures
              </p>
            </div>
            <Button onClick={handleAdd}>Create Policy</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies && policies.length > 0 ? (
                policies.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.policy_code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{item.policy_category}</TableCell>
                    <TableCell>v{item.version}</TableCell>
                    <TableCell>
                      {item.effective_date
                        ? new Date(item.effective_date).toLocaleDateString()
                        : "Not set"}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[item.status]}>{item.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {item.status === "draft" && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(item.id)}
                          >
                            Approve
                          </Button>
                        )}
                        {item.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScheduleReview(item.id)}
                          >
                            Schedule Review
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </Button>
                        {item.status === "draft" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No HR policies found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit HR Policy" : "Create HR Policy"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Leave Policy"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.policy_category}
                  onValueChange={(value) => {
                    if (value === null) {
                      return;
                    }
                    setFormData({ ...formData, policy_category: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Effective Date</label>
                <Input
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Review Cycle (Months)</label>
              <Input
                type="number"
                min="1"
                value={formData.review_cycle_months}
                onChange={(e) =>
                  setFormData({ ...formData, review_cycle_months: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Policy Content</label>
              <Textarea
                value={formData.policy_content}
                onChange={(e) => setFormData({ ...formData, policy_content: e.target.value })}
                placeholder="Enter the policy content..."
                rows={8}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requires_ack"
                checked={formData.requires_acknowledgment}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, requires_acknowledgment: checked === true })
                }
              />
              <label
                htmlFor="requires_ack"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Requires employee acknowledgment
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending || !formData.title.trim()}
            >
              {editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
