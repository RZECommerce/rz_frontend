import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { employeeService } from "@/services/employee.service";
import type { UpdateEmployeeDto } from "@/types/employee";
import { zodResolver } from "@hookform/resolvers/zod";
import { Add as Add01Icon } from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const salaryHistorySchema = z.object({
  salary: z.number().min(0, "Salary must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  effective_date: z.string().min(1, "Effective date is required"),
  notes: z.string().optional().nullable(),
});

type SalaryHistoryFormData = z.infer<typeof salaryHistorySchema>;

interface SalaryHistory {
  id: string;
  salary: number;
  currency: string;
  effective_date: string;
  notes: string | null;
  created_at: string;
}

interface SalaryHistorySectionProps {
  employeeId: string;
  currentSalary?: number;
  currentCurrency?: string;
  isEditMode?: boolean;
}

export function SalaryHistorySection({
  employeeId,
  currentSalary,
  currentCurrency = "PHP",
  isEditMode = true,
}: SalaryHistorySectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [perPage, setPerPage] = React.useState(10);

  // TODO: Replace with actual API call when backend is ready
  const [salaryHistory, setSalaryHistory] = React.useState<SalaryHistory[]>(() => {
    if (currentSalary) {
      return [{
        id: "current",
        salary: currentSalary,
        currency: currentCurrency,
        effective_date: new Date().toISOString().split("T")[0],
        notes: "Current salary",
        created_at: new Date().toISOString(),
      }];
    }
    return [];
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SalaryHistoryFormData>({
    resolver: zodResolver(salaryHistorySchema),
    defaultValues: {
      salary: currentSalary || 0,
      currency: currentCurrency,
      effective_date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const updateSalary = useMutation({
    mutationFn: (data: UpdateEmployeeDto) =>
      employeeService.update(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      toast.success("Salary updated successfully");
      setIsAddDialogOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error("Failed to update salary", {
        description: error.message,
      });
    },
  });

  const filteredHistory = React.useMemo(() => {
    let filtered = salaryHistory;
    if (search) {
      filtered = filtered.filter((entry) =>
        entry.notes?.toLowerCase().includes(search.toLowerCase()) ||
        entry.currency.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered.slice(0, perPage);
  }, [salaryHistory, search, perPage]);

  const onSubmit = (data: SalaryHistoryFormData) => {
    updateSalary.mutate({
      salary: data.salary,
      currency: data.currency,
    } as UpdateEmployeeDto);

    // Add to history
    const newEntry: SalaryHistory = {
      id: Date.now().toString(),
      salary: data.salary,
      currency: data.currency,
      effective_date: data.effective_date,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
    };
    setSalaryHistory((prev) => [newEntry, ...prev]);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Salary History</h3>
        {isEditMode && (
          <Button
            onClick={() => {
              reset({
                salary: currentSalary || 0,
                currency: currentCurrency,
                effective_date: new Date().toISOString().split("T")[0],
                notes: "",
              });
              setIsAddDialogOpen(true);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Add01Icon className="size-5 mr-2" />
            Update Salary
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex items-center gap-2">
          <Select value={perPage.toString()} onValueChange={(v) => setPerPage(Number(v))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">records per page</span>
        </div>

        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search salary history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Effective Date</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Updated At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No salary history available
                </TableCell>
              </TableRow>
            ) : (
              filteredHistory.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.effective_date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(entry.salary, entry.currency)}
                  </TableCell>
                  <TableCell>{entry.currency}</TableCell>
                  <TableCell className="max-w-xs truncate">{entry.notes || "-"}</TableCell>
                  <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Salary</DialogTitle>
            <DialogDescription>
              Update the employee's salary and add it to the salary history
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="salary">
                Salary <span className="text-destructive">*</span>
              </Label>
              <Input
                id="salary"
                type="number"
                step="0.01"
                {...register("salary", { valueAsNumber: true })}
                placeholder="Enter salary"
              />
              {errors.salary && (
                <p className="text-sm text-destructive">{errors.salary.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">
                Currency <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("currency")}
                onValueChange={(v) => setValue("currency", v || "")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PHP">PHP</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
              {errors.currency && (
                <p className="text-sm text-destructive">{errors.currency.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="effective_date">
                Effective Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="effective_date"
                type="date"
                {...register("effective_date")}
              />
              {errors.effective_date && (
                <p className="text-sm text-destructive">{errors.effective_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                {...register("notes")}
                placeholder="Enter notes (optional)"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateSalary.isPending}>
                {updateSalary.isPending ? "Updating..." : "Update Salary"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
