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

const pensionSchema = z.object({
  pension_provider: z.string().optional().nullable(),
  pension_account_number: z.string().optional().nullable(),
  pension_enrollment_date: z.string().optional().nullable(),
  pension_contribution_rate: z.number().min(0).max(100).optional().nullable(),
  pension_enrolled: z.boolean().optional(),
});

type PensionFormData = z.infer<typeof pensionSchema>;

interface PensionRecord {
  id: string;
  pension_provider: string | null;
  pension_account_number: string | null;
  pension_enrollment_date: string | null;
  pension_contribution_rate: number | null;
  pension_enrolled: boolean | null;
  updated_at: string;
}

interface SalaryPensionSectionProps {
  employeeId: string;
  employee: {
    pension_provider?: string | null;
    pension_account_number?: string | null;
    pension_enrollment_date?: string | null;
    pension_contribution_rate?: number | null;
    pension_enrolled?: boolean | null;
    salary?: number;
  };
  isEditMode?: boolean;
}

export function SalaryPensionSection({
  employeeId,
  employee,
  isEditMode = true,
}: SalaryPensionSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [perPage, setPerPage] = React.useState(10);

  // TODO: Replace with actual API call when backend is ready
  const [pensionHistory, setPensionHistory] = React.useState<PensionRecord[]>(() => {
    if (
      employee.pension_provider ||
      employee.pension_account_number ||
      employee.pension_enrollment_date ||
      employee.pension_contribution_rate !== undefined ||
      employee.pension_enrolled !== undefined
    ) {
      return [{
        id: "current",
        pension_provider: employee.pension_provider || null,
        pension_account_number: employee.pension_account_number || null,
        pension_enrollment_date: employee.pension_enrollment_date || null,
        pension_contribution_rate: employee.pension_contribution_rate || null,
        pension_enrolled: employee.pension_enrolled || null,
        updated_at: new Date().toISOString(),
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
  } = useForm<PensionFormData>({
    resolver: zodResolver(pensionSchema),
    defaultValues: {
      pension_provider: employee.pension_provider || "",
      pension_account_number: employee.pension_account_number || "",
      pension_enrollment_date: employee.pension_enrollment_date
        ? new Date(employee.pension_enrollment_date).toISOString().split("T")[0]
        : "",
      pension_contribution_rate: employee.pension_contribution_rate || null,
      pension_enrolled: employee.pension_enrolled ?? false,
    },
  });

  const updatePension = useMutation({
    mutationFn: (data: UpdateEmployeeDto) =>
      employeeService.update(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      toast.success("Pension information updated successfully");
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to update pension information", {
        description: error.message,
      });
    },
  });

  const filteredHistory = React.useMemo(() => {
    let filtered = pensionHistory;
    if (search) {
      filtered = filtered.filter((entry) =>
        entry.pension_provider?.toLowerCase().includes(search.toLowerCase()) ||
        entry.pension_account_number?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered.slice(0, perPage);
  }, [pensionHistory, search, perPage]);

  const onSubmit = (data: PensionFormData) => {
    updatePension.mutate({
      pension_provider: data.pension_provider || null,
      pension_account_number: data.pension_account_number || null,
      pension_enrollment_date: data.pension_enrollment_date || null,
      pension_contribution_rate: data.pension_contribution_rate || null,
      pension_enrolled: data.pension_enrolled ?? false,
    } as UpdateEmployeeDto);

    // Add to history
    const newEntry: PensionRecord = {
      id: Date.now().toString(),
      pension_provider: data.pension_provider || null,
      pension_account_number: data.pension_account_number || null,
      pension_enrollment_date: data.pension_enrollment_date || null,
      pension_contribution_rate: data.pension_contribution_rate || null,
      pension_enrolled: data.pension_enrolled ?? false,
      updated_at: new Date().toISOString(),
    };
    setPensionHistory((prev) => [newEntry, ...prev]);
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pension Information</h3>
        {isEditMode && (
          <Button
            onClick={() => {
              reset({
                pension_provider: employee.pension_provider || "",
                pension_account_number: employee.pension_account_number || "",
                pension_enrollment_date: employee.pension_enrollment_date
                  ? new Date(employee.pension_enrollment_date).toISOString().split("T")[0]
                  : "",
                pension_contribution_rate: employee.pension_contribution_rate || null,
                pension_enrolled: employee.pension_enrolled ?? false,
              });
              setIsAddDialogOpen(true);
            }}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Add01Icon className="size-5 mr-2" />
            {pensionHistory.length > 0 ? "Update Pension" : "Add Pension"}
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
            placeholder="Search pension records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>Enrollment Date</TableHead>
              <TableHead>Contribution Rate</TableHead>
              <TableHead>Monthly Contribution</TableHead>
              <TableHead>Enrolled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No pension information available
                </TableCell>
              </TableRow>
            ) : (
              filteredHistory.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.pension_provider || "-"}</TableCell>
                  <TableCell>{entry.pension_account_number || "-"}</TableCell>
                  <TableCell>
                    {entry.pension_enrollment_date
                      ? new Date(entry.pension_enrollment_date).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {entry.pension_contribution_rate !== null && entry.pension_contribution_rate !== undefined
                      ? `${entry.pension_contribution_rate}%`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {employee.salary &&
                      entry.pension_contribution_rate !== null &&
                      entry.pension_contribution_rate !== undefined
                      ? formatCurrency((employee.salary * entry.pension_contribution_rate) / 100)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {entry.pension_enrolled !== null && entry.pension_enrolled !== undefined
                      ? entry.pension_enrolled
                        ? "Yes"
                        : "No"
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pensionHistory.length > 0 ? "Update Pension" : "Add Pension"}
            </DialogTitle>
            <DialogDescription>
              {pensionHistory.length > 0
                ? "Update pension information"
                : "Add pension information for this employee"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pension_provider">Pension Provider</Label>
              <Input
                id="pension_provider"
                {...register("pension_provider")}
                placeholder="Enter pension provider"
                disabled={!isEditMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pension_account_number">Pension Account Number</Label>
              <Input
                id="pension_account_number"
                {...register("pension_account_number")}
                placeholder="Enter account number"
                disabled={!isEditMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pension_enrollment_date">Enrollment Date</Label>
              <Input
                id="pension_enrollment_date"
                type="date"
                {...register("pension_enrollment_date")}
                disabled={!isEditMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pension_contribution_rate">Contribution Rate (%)</Label>
              <Input
                id="pension_contribution_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register("pension_contribution_rate", { valueAsNumber: true })}
                placeholder="Enter contribution rate"
                disabled={!isEditMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pension_enrolled">Pension Enrolled</Label>
              <Select
                value={watch("pension_enrolled") ? "true" : "false"}
                onValueChange={(v) => setValue("pension_enrolled", v === "true")}
                disabled={!isEditMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isEditMode && (
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
                <Button type="submit" disabled={updatePension.isPending}>
                  {updatePension.isPending ? "Updating..." : "Update Pension"}
                </Button>
              </DialogFooter>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
