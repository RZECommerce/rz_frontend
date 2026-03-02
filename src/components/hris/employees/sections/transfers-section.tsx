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
import { Textarea } from "@/components/ui/textarea";
import { transferService } from "@/services/core-hr.service";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  Edit as Edit01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const transferSchema = z.object({
  transfer_date: z.string().min(1, "Transfer date is required"),
  from_department: z.string().min(1, "From department is required"),
  to_department: z.string().min(1, "To department is required"),
  from_location: z.string().optional().nullable(),
  to_location: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface Transfer {
  id: string;
  transfer_date: string;
  from_department: string;
  to_department: string;
  from_location: string | null;
  to_location: string | null;
  reason: string | null;
}

interface TransfersSectionProps {
  employeeId: string;
  isEditMode?: boolean;
}

export function TransfersSection({ employeeId, isEditMode = true }: TransfersSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [perPage, setPerPage] = React.useState(10);

  const { data: transfersData, isLoading } = useQuery({
    queryKey: ["transfers", employeeId, { search, per_page: perPage }],
    queryFn: () => transferService.getAll({ employee_id: employeeId, search, per_page: perPage }),
  });

  const transfers: Transfer[] = React.useMemo(() => {
    if (!transfersData?.data) return [];
    return transfersData.data.map((t) => ({
      id: t.id,
      transfer_date: t.transfer_date,
      from_department: t.from_department?.name || "Previous Dept",
      to_department: t.to_department?.name || "New Dept",
      from_location: null,
      to_location: null,
      reason: t.description || null,
    }));
  }, [transfersData]);

  const deleteTransfer = useMutation({
    mutationFn: (id: string) => transferService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers", employeeId] });
      toast.success("Transfer deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete transfer", { description: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      transfer_date: "",
      from_department: "",
      to_department: "",
      from_location: "",
      to_location: "",
      reason: "",
    },
  });

  const filteredTransfers = React.useMemo(() => {
    let filtered = transfers;
    if (search) {
      filtered = filtered.filter(
        (transfer) =>
          transfer.from_department.toLowerCase().includes(search.toLowerCase()) ||
          transfer.to_department.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered.slice(0, perPage);
  }, [transfers, search, perPage]);

  React.useEffect(() => {
    if (editingId) {
      const transfer = transfers.find((t) => t.id === editingId);
      if (transfer) {
        reset({
          transfer_date: transfer.transfer_date,
          from_department: transfer.from_department,
          to_department: transfer.to_department,
          from_location: transfer.from_location || "",
          to_location: transfer.to_location || "",
          reason: transfer.reason || "",
        });
        setIsAddDialogOpen(true);
      }
    }
  }, [editingId, transfers, reset]);

  const onSubmit = (data: TransferFormData) => {
    toast.info("Create/update functionality coming soon");
    setIsAddDialogOpen(false);
    setEditingId(null);
    reset();
  };

  const handleDelete = (id: string) => {
    deleteTransfer.mutate(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Transfer Records</h3>
        {isEditMode && (
          <Button
            onClick={() => {
              reset();
              setEditingId(null);
              setIsAddDialogOpen(true);
            }}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Add01Icon className="size-5 mr-2" />
            Add Transfer
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
            placeholder="Search transfers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transfer Date</TableHead>
              <TableHead>From Department</TableHead>
              <TableHead>To Department</TableHead>
              <TableHead>From Location</TableHead>
              <TableHead>To Location</TableHead>
              {isEditMode && <TableHead className="text-right">action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransfers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isEditMode ? 6 : 5} className="h-24 text-center text-muted-foreground">
                  No data available in table
                </TableCell>
              </TableRow>
            ) : (
              filteredTransfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell>{new Date(transfer.transfer_date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{transfer.from_department}</TableCell>
                  <TableCell className="font-medium">{transfer.to_department}</TableCell>
                  <TableCell>{transfer.from_location || "-"}</TableCell>
                  <TableCell>{transfer.to_location || "-"}</TableCell>
                  {isEditMode && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontalIcon className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingId(transfer.id)}>
                            <Edit01Icon className="size-5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(transfer.id)}
                            className="text-destructive"
                          >
                            <Delete01Icon className="size-5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Transfer" : "Add Transfer"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update transfer information" : "Add a new transfer record"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transfer_date">
                Transfer Date <span className="text-destructive">*</span>
              </Label>
              <Input id="transfer_date" type="date" {...register("transfer_date")} />
              {errors.transfer_date && (
                <p className="text-sm text-destructive">{errors.transfer_date.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_department">
                  From Department <span className="text-destructive">*</span>
                </Label>
                <Input id="from_department" {...register("from_department")} placeholder="Enter department" />
                {errors.from_department && (
                  <p className="text-sm text-destructive">{errors.from_department.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="to_department">
                  To Department <span className="text-destructive">*</span>
                </Label>
                <Input id="to_department" {...register("to_department")} placeholder="Enter department" />
                {errors.to_department && (
                  <p className="text-sm text-destructive">{errors.to_department.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_location">From Location</Label>
                <Input id="from_location" {...register("from_location")} placeholder="Enter location" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to_location">To Location</Label>
                <Input id="to_location" {...register("to_location")} placeholder="Enter location" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                {...register("reason")}
                placeholder="Enter reason for transfer"
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
              <Button type="submit">{editingId ? "Update" : "Add"} Transfer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
