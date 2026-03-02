import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { trainingService } from "@/services/training.service";
import type { CreateTrainingDto, Training } from "@/types/training";
import {
    Add as Add01Icon,
    Delete as Delete01Icon,
    Edit as Edit01Icon,
    MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import * as React from "react";
import { toast } from "sonner";
import { TrainingForm } from "./training-form";

export function TrainingListTab() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTraining, setEditingTraining] = React.useState<Training | null>(null);

  const { data: trainings = [], isLoading } = useQuery({
    queryKey: ["trainings"],
    queryFn: () => trainingService.getTrainings(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => trainingService.deleteTraining(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      toast.success("Training deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete training");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTrainingDto) => trainingService.createTraining(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      setIsFormOpen(false);
      setEditingTraining(null);
      toast.success("Training created successfully");
    },
    onError: () => {
      toast.error("Failed to create training");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTrainingDto> }) =>
      trainingService.updateTraining(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      setIsFormOpen(false);
      setEditingTraining(null);
      toast.success("Training updated successfully");
    },
    onError: () => {
      toast.error("Failed to update training");
    },
  });

  const handleAdd = () => {
    setEditingTraining(null);
    setIsFormOpen(true);
  };

  const handleEdit = (training: Training) => {
    setEditingTraining(training);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this training?")) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "ongoing":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "planned":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSubmit = (data: CreateTrainingDto) => {
    if (editingTraining) {
      updateMutation.mutate({ id: editingTraining.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading trainings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Training List</h3>
          <p className="text-sm text-muted-foreground">
            Manage all training programs and sessions
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Add01Icon className="size-5" />
          Add Training
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Training Code</TableHead>
                <TableHead className="min-w-[200px]">Title</TableHead>
                <TableHead className="min-w-[150px]">Type</TableHead>
                <TableHead className="min-w-[120px]">Start Date</TableHead>
                <TableHead className="min-w-[120px]">End Date</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Participants</TableHead>
                <TableHead className="text-right min-w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No trainings found
                  </TableCell>
                </TableRow>
              ) : (
                trainings.map((training) => (
                  <TableRow key={training.id}>
                    <TableCell className="font-medium">{training.training_code}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={training.title}>
                      {training.title}
                    </TableCell>
                    <TableCell>{training.training_type?.name || "-"}</TableCell>
                    <TableCell>
                      {training.start_date ? format(new Date(training.start_date), "MMM d, yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      {training.end_date ? format(new Date(training.end_date), "MMM d, yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(training.status)}>
                        {training.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {training.max_participants ? `${training.max_participants} max` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontalIcon className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(training)}>
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <TrainingForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        training={editingTraining}
      />
    </div>
  );
}
