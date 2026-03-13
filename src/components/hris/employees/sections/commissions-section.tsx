import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  commissionService,
  type Commission,
  type CreateCommissionDto,
  type UpdateCommissionDto,
} from "@/services/core-hr.service";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  Edit as Edit01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const commissionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().min(0, "Amount must be positive"),
  commission_date: z.string().min(1, "Commission date is required"),
  description: z.string().optional().nullable(),
});

type CommissionFormData = z.infer<typeof commissionSchema>;

interface CommissionsSectionProps {
  employeeId: string;
  isEditMode?: boolean;
}

export function CommissionsSection({ employeeId, isEditMode = true }: CommissionsSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const { data: commissionsData, isLoading } = useQuery({
    queryKey: ["employee-commissions", employeeId],
    queryFn: () => commissionService.getAll({ employee_id: employeeId }),
  });

  const commissions = React.useMemo(() => {
    if (!commissionsData?.data) return [];
    return commissionsData.data;
  }, [commissionsData]);

  const createMutation = useMutation({
    mutationFn: (data: CreateCommissionDto) => commissionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-commissions", employeeId] });
      toast.success("Commission added successfully");
      setIsAddDialogOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error("Failed to add commission", { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommissionDto }) =>
      commissionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-commissions", employeeId] });
      toast.success("Commission updated successfully");
      setIsAddDialogOpen(false);
      setEditingId(null);
      reset();
    },
    onError: (error: Error) => {
      toast.error("Failed to update commission", { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => commissionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-commissions", employeeId] });
      toast.success("Commission deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete commission", { description: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CommissionFormData>({
    resolver: zodResolver(commissionSchema),
    defaultValues: {
      title: "",
      amount: 0,
      commission_date: "",
      description: "",
    },
  });

  React.useEffect(() => {
    if (editingId) {
      const commission = commissions.find((c) => c.id === editingId);
      if (commission) {
        reset({
          title: commission.title,
          amount: commission.amount,
          commission_date: commission.commission_date,
          description: commission.description || "",
        });
        setIsAddDialogOpen(true);
      }
    }
  }, [editingId, commissions, reset]);

  const onSubmit = (data: CommissionFormData) => {
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: {
          title: data.title,
          amount: data.amount,
          commission_date: data.commission_date,
          description: data.description || undefined,
        },
      });
    } else {
      createMutation.mutate({
        employee_id: employeeId,
        title: data.title,
        amount: data.amount,
        commission_date: data.commission_date,
        description: data.description || undefined,
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this commission?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "₱0.00";
    return `₱${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Commissions</h3>
        {isEditMode && (
          <Button
            onClick={() => {
              reset({
                title: "",
                amount: 0,
                commission_date: "",
                description: "",
              });
              setEditingId(null);
              setIsAddDialogOpen(true);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Add01Icon className="size-5 mr-2" />
            Add Commission
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading commissions...
        </div>
      ) : commissions.length > 0 ? (
        <div className="space-y-4">
          {commissions.map((commission: Commission) => (
            <div key={commission.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{commission.title}</h4>
                  {commission.description && (
                    <p className="text-sm text-muted-foreground mt-1">{commission.description}</p>
                  )}
                </div>
                {isEditMode && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontalIcon className="size-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingId(commission.id)}>
                        <Edit01Icon className="size-5 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(commission.id)}
                        className="text-destructive"
                      >
                        <Delete01Icon className="size-5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Amount: </span>
                  <span className="font-medium">{formatCurrency(commission.amount)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Commission Date: </span>
                  <span className="font-medium">{formatDate(commission.commission_date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No commissions found.</p>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Commission" : "Add Commission"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update commission information" : "Add a new commission for this employee"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input id="title" {...register("title")} placeholder="Enter commission title" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                placeholder="Enter amount"
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission_date">
                Commission Date <span className="text-destructive">*</span>
              </Label>
              <Input id="commission_date" type="date" {...register("commission_date")} />
              {errors.commission_date && (
                <p className="text-sm text-destructive">{errors.commission_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter description"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingId(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Update" : "Add"} Commission
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
