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
import { deductionService, deductionTypeService } from "@/services/payroll.service";
import type { Deduction, DeductionTypeData, DeductionType } from "@/types/payroll";
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

interface ManageEmployeeDeductionsModalProps {
  employeeId: string;
  employeeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DeductionFormData {
  deduction_type_id: string;
  name: string;
  calculation_type: "fixed" | "percentage" | "installment";
  amount: string;
  percentage: string;
  installment_count: string;
  is_active: boolean;
  effective_date: string;
  end_date: string;
  description: string;
}

export function ManageEmployeeDeductionsModal({
  employeeId,
  employeeName,
  open,
  onOpenChange,
}: ManageEmployeeDeductionsModalProps) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<DeductionFormData>({
    deduction_type_id: "",
    name: "",
    calculation_type: "fixed",
    amount: "",
    percentage: "",
    installment_count: "",
    is_active: true,
    effective_date: new Date().toISOString().split("T")[0],
    end_date: "",
    description: "",
  });

  const { data: deductionsData, isLoading: deductionsLoading } = useQuery({
    queryKey: ["deductions", "employee", employeeId],
    queryFn: () => deductionService.getAll({ employee_id: employeeId }),
    enabled: open && !!employeeId,
  });

  const { data: typesData, isLoading: typesLoading } = useQuery({
    queryKey: ["deductionTypes"],
    queryFn: () => deductionTypeService.getAll(),
    enabled: open,
  });

  const deductions = deductionsData?.data || [];
  const deductionTypes = typesData || [];

  const createMutation = useMutation({
    mutationFn: deductionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deductions"] });
      toast.success("Deduction added successfully");
      resetForm();
      setIsAdding(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to add deduction", {
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      deductionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deductions"] });
      toast.success("Deduction updated successfully");
      resetForm();
      setEditingId(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update deduction", {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deductionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deductions"] });
      toast.success("Deduction deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete deduction", {
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      deduction_type_id: "",
      name: "",
      calculation_type: "fixed",
      amount: "",
      percentage: "",
      installment_count: "",
      is_active: true,
      effective_date: new Date().toISOString().split("T")[0],
      end_date: "",
      description: "",
    });
  };

  const handleEdit = (deduction: Deduction) => {
    setEditingId(deduction.id);
    setFormData({
      deduction_type_id: deduction.deduction_type_id || "",
      name: deduction.name,
      calculation_type: deduction.calculation_type,
      amount: deduction.amount.toString(),
      percentage: deduction.percentage?.toString() || "",
      installment_count: deduction.installment_count?.toString() || "",
      is_active: deduction.is_active,
      effective_date: deduction.effective_date,
      end_date: deduction.end_date || "",
      description: deduction.description || "",
    });
    setIsAdding(false);
  };

  const handleSubmit = () => {
    const selectedType = deductionTypes.find((t) => t.id === formData.deduction_type_id);
    
    const payload = {
      employee_id: employeeId,
      deduction_type_id: formData.deduction_type_id || undefined,
      deduction_type: (selectedType?.category || "other") as DeductionType,
      name: formData.name || selectedType?.name || "",
      calculation_type: formData.calculation_type,
      amount: parseFloat(formData.amount) || 0,
      percentage: formData.percentage ? parseFloat(formData.percentage) : undefined,
      installment_count: formData.installment_count ? parseInt(formData.installment_count) : undefined,
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
    const selectedType = deductionTypes.find((t: DeductionTypeData) => t.id === typeId);
    if (selectedType) {
      setFormData((prev) => ({
        ...prev,
        deduction_type_id: typeId,
        name: selectedType.name,
        calculation_type: selectedType.calculation_type,
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
            Manage Deductions - {employeeName}
          </DialogTitle>
          <DialogDescription>
            Add, edit, or remove deductions for this employee
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Add/Edit Form */}
          {(isAdding || editingId) && (
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold">
                {editingId ? "Edit Deduction" : "Add New Deduction"}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Deduction Type</Label>
                  <Select
                    value={formData.deduction_type_id}
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select deduction type" />
                    </SelectTrigger>
                    <SelectContent>
                      {deductionTypes.map((type: DeductionTypeData) => (
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
                    placeholder="Deduction name"
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
                      <SelectItem value="installment">Installment</SelectItem>
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

                {formData.calculation_type === "installment" && (
                  <div className="space-y-2">
                    <Label>Installment Count</Label>
                    <Input
                      type="number"
                      value={formData.installment_count}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          installment_count: e.target.value,
                        }))
                      }
                      placeholder="Number of installments"
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
                  {editingId ? "Update" : "Add"} Deduction
                </Button>
              </div>
            </div>
          )}

          {/* Existing Deductions Table */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Current Deductions</h3>
              {!isAdding && !editingId && (
                <Button onClick={() => setIsAdding(true)} size="sm">
                  <AddIcon className="size-4 mr-2" />
                  Add Deduction
                </Button>
              )}
            </div>

            <div className="rounded-lg border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Deduction</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Calculation</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deductionsLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : deductions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No deductions assigned yet. Click "Add Deduction" to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    deductions.map((deduction: Deduction) => (
                      <TableRow key={deduction.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{deduction.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {deduction.deductionType?.code || deduction.deduction_code}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize text-xs">
                            {deduction.deductionType?.category || deduction.deduction_type}
                          </span>
                        </TableCell>
                        <TableCell className="capitalize text-xs">
                          {deduction.calculation_type.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell className="font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(deduction.amount)}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div>{formatDate(deduction.effective_date)}</div>
                          {deduction.end_date && (
                            <div className="text-muted-foreground">
                              to {formatDate(deduction.end_date)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                              deduction.is_active
                                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400"
                                : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400"
                            )}
                          >
                            {deduction.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(deduction)}
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
                                    "Are you sure you want to delete this deduction?"
                                  )
                                ) {
                                  deleteMutation.mutate(deduction.id);
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
