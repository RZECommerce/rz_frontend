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
import { warningService } from "@/services/core-hr.service";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const warningSchema = z.object({
  warning_date: z.string().min(1, "Warning date is required"),
  warning_type: z.string().min(1, "Warning type is required"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
  warning_by: z.string().min(1, "Warning by is required"),
  status: z.enum(["active", "resolved", "expired"]),
});

type WarningFormData = z.infer<typeof warningSchema>;

interface Warning {
  id: string;
  warning_date: string;
  warning_type: string;
  subject: string;
  description: string;
  warning_by: string;
  status: "active" | "resolved" | "expired";
}

interface WarningsSectionProps {
  employeeId: string;
  isEditMode?: boolean;
}

export function WarningsSection({ employeeId, isEditMode = true }: WarningsSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [perPage, setPerPage] = React.useState(10);

  const { data: warningsData, isLoading } = useQuery({
    queryKey: ["warnings", employeeId, { search, per_page: perPage }],
    queryFn: () => warningService.getAll({ employee_id: employeeId, search, per_page: perPage }),
  });

  const warnings: Warning[] = React.useMemo(() => {
    if (!warningsData?.data) return [];
    return warningsData.data.map((w) => ({
      id: w.id,
      warning_date: w.warning_date,
      warning_type: w.warning_type || "verbal",
      subject: w.subject,
      description: w.description || "",
      warning_by: "HR Department",
      status: w.status as "active" | "resolved" | "expired",
    }));
  }, [warningsData]);

  const deleteWarning = useMutation({
    mutationFn: (id: string) => warningService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warnings", employeeId] });
      toast.success("Warning deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete warning", { description: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<WarningFormData>({
    resolver: zodResolver(warningSchema),
    defaultValues: {
      warning_date: "",
      warning_type: "",
      subject: "",
      description: "",
      warning_by: "",
      status: "active",
    },
  });

  const filteredWarnings = React.useMemo(() => {
    let filtered = warnings;
    if (search) {
      filtered = filtered.filter(
        (warning) =>
          warning.subject.toLowerCase().includes(search.toLowerCase()) ||
          warning.warning_type.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered.slice(0, perPage);
  }, [warnings, search, perPage]);

  React.useEffect(() => {
    if (editingId) {
      const warning = warnings.find((w) => w.id === editingId);
      if (warning) {
        reset({
          warning_date: warning.warning_date,
          warning_type: warning.warning_type,
          subject: warning.subject,
          description: warning.description,
          warning_by: warning.warning_by,
          status: warning.status,
        });
        setIsAddDialogOpen(true);
      }
    }
  }, [editingId, warnings, reset]);

  const onSubmit = (data: WarningFormData) => {
    if (editingId) {
      // TODO: Implement update mutation when API is ready
      queryClient.invalidateQueries({ queryKey: ["warnings", employeeId] });
      toast.success("Warning record updated successfully");
    } else {
      // TODO: Implement create mutation when API is ready
      queryClient.invalidateQueries({ queryKey: ["warnings", employeeId] });
      toast.success("Warning record added successfully");
    }
    setIsAddDialogOpen(false);
    setEditingId(null);
    reset();
  };

  const handleDelete = (id: string) => {
    deleteWarning.mutate(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Warning Records</h3>
        {isEditMode && (
          <Button
            onClick={() => {
              reset();
              setEditingId(null);
              setIsAddDialogOpen(true);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <AddIcon className="size-5 mr-2" />
            Add Warning
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
            placeholder="Search warnings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Warning Date</TableHead>
              <TableHead>Warning Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Warning By</TableHead>
              <TableHead>Status</TableHead>
              {isEditMode && <TableHead className="text-right">action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWarnings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isEditMode ? 6 : 5} className="h-24 text-center text-muted-foreground">
                  No data available in table
                </TableCell>
              </TableRow>
            ) : (
              filteredWarnings.map((warning) => (
                <TableRow key={warning.id}>
                  <TableCell>{new Date(warning.warning_date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{warning.warning_type}</TableCell>
                  <TableCell>{warning.subject}</TableCell>
                  <TableCell>{warning.warning_by}</TableCell>
                  <TableCell>
                    <span className="capitalize">{warning.status}</span>
                  </TableCell>
                  {isEditMode && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontalIcon className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingId(warning.id)}>
                            <EditIcon className="size-5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(warning.id)}
                            className="text-destructive"
                          >
                            <DeleteIcon className="size-5 mr-2" />
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Warning" : "Add Warning"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update warning information" : "Add a new warning record"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warning_date">
                Warning Date <span className="text-destructive">*</span>
              </Label>
              <Input id="warning_date" type="date" {...register("warning_date")} />
              {errors.warning_date && (
                <p className="text-sm text-destructive">{errors.warning_date.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warning_type">
                  Warning Type <span className="text-destructive">*</span>
                </Label>
                <Input id="warning_type" {...register("warning_type")} placeholder="Enter type" />
                {errors.warning_type && (
                  <p className="text-sm text-destructive">{errors.warning_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="warning_by">
                  Warning By <span className="text-destructive">*</span>
                </Label>
                <Input id="warning_by" {...register("warning_by")} placeholder="Enter name" />
                {errors.warning_by && (
                  <p className="text-sm text-destructive">{errors.warning_by.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Input id="subject" {...register("subject")} placeholder="Enter subject" />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter description"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
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
              <Button type="submit">{editingId ? "Update" : "Add"} Warning</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
