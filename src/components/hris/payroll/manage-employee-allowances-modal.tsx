import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { salaryComponentService, salaryComponentTypeService } from "@/services/payroll.service";
import type { SalaryComponent, SalaryComponentTypeData } from "@/types/payroll";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface ManageEmployeeAllowancesModalProps {
  employeeId: string;
  employeeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ComponentFormData {
  component_type_id: string;
  name: string;
  calculation_type: "fixed" | "percentage" | "per_day" | "per_hour";
  amount: string;
  percentage: string;
  is_taxable: boolean;
  is_active: boolean;
  effective_date: string;
  end_date: string;
  description: string;
}

export function ManageEmployeeAllowancesModal({
  employeeId,
  employeeName,
  open,
  onOpenChange,
}: ManageEmployeeAllowancesModalProps) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<ComponentFormData>({
    component_type_id: "",
    name: "",
    calculation_type: "fixed",
    amount: "",
    percentage: "",
    is_taxable: true,
    is_active: true,
    effective_date: new Date().toISOString().split("T")[0],
    end_date: "",
    description: "",
  });

  const { data: componentsData, isLoading: componentsLoading } = useQuery({
    queryKey: ["salaryComponents", "employee", employeeId],
    queryFn: () => salaryComponentService.getAll({ employee_id: employeeId }),
    enabled: open && !!employeeId,
  });

  const { data: typesData, isLoading: typesLoading } = useQuery({
    queryKey: ["salaryComponentTypes"],
    queryFn: () => salaryComponentTypeService.getAll(),
    enabled: open,
  });

  const components = componentsData?.data || [];
  const componentTypes = typesData || [];

  const createMutation = useMutation({
    mutationFn: salaryComponentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaryComponents"] });
      toast.success("Allowance added successfully");
      resetForm();
      setIsAdding(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to add allowance", {
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      salaryComponentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaryComponents"] });
      toast.success("Allowance updated successfully");
      resetForm();
      setEditingId(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update allowance", {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: salaryComponentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaryComponents"] });
      toast.success("Allowance deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete allowance", {
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      component_type_id: "",
      name: "",
      calculation_type: "fixed",
      amount: "",
      percentage: "",
      is_taxable: true,
      is_active: true,
      effective_date: new Date().toISOString().split("T")[0],
      end_date: "",
      description: "",
    });
  };

  const handleEdit = (component: SalaryComponent) => {
    setEditingId(component.id);
    setFormData({
      component_type_id: component.component_type_id || "",
      name: component.name,
      calculation_type: component.calculation_type,
      amount: component.amount.toString(),
      percentage: component.percentage?.toString() || "",
      is_taxable: component.is_taxable,
      is_active: component.is_active,
      effective_date: component.effective_date,
      end_date: component.end_date || "",
      description: component.description || "",
    });
    setIsAdding(false);
  };

  const handleSubmit = () => {
    const selectedType = componentTypes.find((t: SalaryComponentTypeData) => t.id === formData.component_type_id);
    
    const payload = {
      employee_id: employeeId,
      component_type_id: formData.component_type_id || undefined,
      component_type: (selectedType?.category || "allowance") as "allowance" | "bonus" | "commission" | "other",
      name: formData.name || selectedType?.name || "",
      calculation_type: formData.calculation_type,
      amount: parseFloat(formData.amount) || 0,
      percentage: formData.percentage ? parseFloat(formData.percentage) : undefined,
      is_taxable: formData.is_taxable,
      is_active: formData.is_active,
      effective_date: formData.effective_date,
      end_date: formData.end_date || undefined,
      description: formData.description || undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleTypeChange = (typeId: string | null) => {
    if (!typeId) return;
    const selectedType = componentTypes.find((t: SalaryComponentTypeData) => t.id === typeId);
    if (selectedType) {
      setFormData((prev) => ({
        ...prev,
        component_type_id: typeId,
        name: selectedType.name,
        calculation_type: selectedType.calculation_type,
        is_taxable: selectedType.is_taxable,
      }));
    }
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Manage Allowances - {employeeName}
          </DialogTitle>
          <DialogDescription>
            Add, edit, or remove salary components for this employee
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Add/Edit Form */}
          {(isAdding || editingId) && (
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">
                {editingId ? "Edit Allowance" : "Add New Allowance"}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Component Type</Label>
                  <Select
                    value={formData.component_type_id}
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select component type" />
                    </SelectTrigger>
                    <SelectContent>
                      {componentTypes.map((type: SalaryComponentTypeData) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} ({type.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Component name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Calculation Type</Label>
                  <Select
                    value={formData.calculation_type}
                    onValueChange={(value: any) =>
                      setFormData((prev) => ({ ...prev, calculation_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="per_day">Per Day</SelectItem>
                      <SelectItem value="per_hour">Per Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    placeholder="0.00"
                  />
                </div>

                {formData.calculation_type === "percentage" && (
                  <div className="space-y-2">
                    <Label>Percentage</Label>
                    <Input
                      type="number"
                      value={formData.percentage}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, percentage: e.target.value }))
                      }
                      placeholder="0.00"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Effective Date</Label>
                  <Input
                    type="date"
                    value={formData.effective_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        effective_date: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, end_date: e.target.value }))
                    }
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Description (Optional)</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Optional description"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.is_taxable}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_taxable: checked as boolean,
                        }))
                      }
                    />
                    <Label>Taxable</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_active: checked as boolean,
                        }))
                      }
                    />
                    <Label>Active</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsAdding(false);
                    setEditingId(null);
                  }}
                >
                  <CloseIcon className="size-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !formData.name ||
                    !formData.amount ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                >
                  <SaveIcon className="size-4 mr-2" />
                  {editingId ? "Update" : "Add"} Allowance
                </Button>
              </div>
            </div>
          )}

          {/* Existing Components Table */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Current Allowances</h3>
              {!isAdding && !editingId && (
                <Button onClick={() => setIsAdding(true)} size="sm">
                  <AddIcon className="size-4 mr-2" />
                  Add Allowance
                </Button>
              )}
            </div>

            <div className="rounded-lg border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Component</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Calculation</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {componentsLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : components.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No allowances assigned yet. Click "Add Allowance" to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    components.map((component: SalaryComponent) => (
                      <TableRow key={component.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{component.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {component.componentType?.code || component.salary_component_code}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize text-xs">
                            {component.componentType?.category || component.component_type}
                          </span>
                        </TableCell>
                        <TableCell className="capitalize text-xs">
                          {component.calculation_type.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(component.amount)}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div>{formatDate(component.effective_date)}</div>
                          {component.end_date && (
                            <div className="text-muted-foreground">
                              to {formatDate(component.end_date)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                              component.is_active
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                                : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400"
                            )}
                          >
                            {component.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(component)}
                              disabled={isAdding || editingId !== null}
                            >
                              <EditIcon className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (
                                  confirm(
                                    "Are you sure you want to delete this allowance?"
                                  )
                                ) {
                                  deleteMutation.mutate(component.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              <DeleteIcon className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
