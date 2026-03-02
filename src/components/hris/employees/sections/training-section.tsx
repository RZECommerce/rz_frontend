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
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  Edit as Edit01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

const trainingSchema = z.object({
  training_name: z.string().min(1, "Training name is required"),
  training_provider: z.string().min(1, "Training provider is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  status: z.enum(["completed", "ongoing", "scheduled", "cancelled"]),
  description: z.string().optional().nullable(),
});

type TrainingFormData = z.infer<typeof trainingSchema>;

interface Training {
  id: string;
  training_name: string;
  training_provider: string;
  start_date: string;
  end_date: string;
  status: "completed" | "ongoing" | "scheduled" | "cancelled";
  description: string | null;
}

interface TrainingSectionProps {
  employeeId: string;
  isEditMode?: boolean;
}

export function TrainingSection({ employeeId, isEditMode = true }: TrainingSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [perPage, setPerPage] = React.useState(10);

  const { data: trainingsData, isLoading } = useQuery({
    queryKey: ["trainings", employeeId, { search, per_page: perPage }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (employeeId) params.append("employee_id", employeeId);
      if (search) params.append("search", search);
      params.append("per_page", perPage.toString());
      const url = `${API_ENDPOINTS.trainings.list}?${params.toString()}`;
      const response = await api.get<{ data: { id: string; name: string; start_date: string; end_date: string; status: string; description?: string; trainer?: { name: string } }[] }>(url);
      return response.data;
    },
  });

  const trainings: Training[] = React.useMemo(() => {
    if (!trainingsData?.data) return [];
    return trainingsData.data.map((t) => ({
      id: t.id,
      training_name: t.name || "Training",
      training_provider: t.trainer?.name || "Internal",
      start_date: t.start_date,
      end_date: t.end_date,
      status: (t.status || "scheduled") as "completed" | "ongoing" | "scheduled" | "cancelled",
      description: t.description || null,
    }));
  }, [trainingsData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TrainingFormData>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      training_name: "",
      training_provider: "",
      start_date: "",
      end_date: "",
      status: "scheduled",
      description: "",
    },
  });

  const filteredTrainings = React.useMemo(() => {
    let filtered = trainings;
    if (search) {
      filtered = filtered.filter(
        (training) =>
          training.training_name.toLowerCase().includes(search.toLowerCase()) ||
          training.training_provider.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered.slice(0, perPage);
  }, [trainings, search, perPage]);

  React.useEffect(() => {
    if (editingId) {
      const training = trainings.find((t) => t.id === editingId);
      if (training) {
        reset({
          training_name: training.training_name,
          training_provider: training.training_provider,
          start_date: training.start_date,
          end_date: training.end_date,
          status: training.status,
          description: training.description || "",
        });
        setIsAddDialogOpen(true);
      }
    }
  }, [editingId, trainings, reset]);

  const onSubmit = (data: TrainingFormData) => {
    toast.info("Create/update functionality coming soon");
    setIsAddDialogOpen(false);
    setEditingId(null);
    reset();
  };

  const handleDelete = (id: string) => {
    toast.info("Delete functionality coming soon");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Training Records</h3>
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
            Add Training
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
            placeholder="Search training records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Training Name</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              {isEditMode && <TableHead className="text-right">action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrainings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isEditMode ? 6 : 5} className="h-24 text-center text-muted-foreground">
                  No data available in table
                </TableCell>
              </TableRow>
            ) : (
              filteredTrainings.map((training) => (
                <TableRow key={training.id}>
                  <TableCell className="font-medium">{training.training_name}</TableCell>
                  <TableCell>{training.training_provider}</TableCell>
                  <TableCell>{new Date(training.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(training.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className="capitalize">{training.status}</span>
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
                          <DropdownMenuItem onClick={() => setEditingId(training.id)}>
                            <Edit01Icon className="size-5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(training.id)}
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
            <DialogTitle>{editingId ? "Edit Training" : "Add Training"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update training information" : "Add a new training record"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="training_name">
                Training Name <span className="text-destructive">*</span>
              </Label>
              <Input id="training_name" {...register("training_name")} placeholder="Enter training name" />
              {errors.training_name && (
                <p className="text-sm text-destructive">{errors.training_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="training_provider">
                Training Provider <span className="text-destructive">*</span>
              </Label>
              <Input id="training_provider" {...register("training_provider")} placeholder="Enter provider" />
              {errors.training_provider && (
                <p className="text-sm text-destructive">{errors.training_provider.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input id="start_date" type="date" {...register("start_date")} />
                {errors.start_date && (
                  <p className="text-sm text-destructive">{errors.start_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">
                  End Date <span className="text-destructive">*</span>
                </Label>
                <Input id="end_date" type="date" {...register("end_date")} />
                {errors.end_date && (
                  <p className="text-sm text-destructive">{errors.end_date.message}</p>
                )}
              </div>
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
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
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
              <Button type="submit">{editingId ? "Update" : "Add"} Training</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
