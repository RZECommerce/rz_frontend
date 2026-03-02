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
import type { CreateTrainerDto, Trainer } from "@/types/training";
import {
    Add as Add01Icon,
    Delete as Delete01Icon,
    Edit as Edit01Icon,
    MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import { TrainerForm } from "./trainer-form";

export function TrainersTab() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTrainer, setEditingTrainer] = React.useState<Trainer | null>(null);

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ["trainers"],
    queryFn: () => trainingService.getTrainers(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => trainingService.deleteTrainer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      toast.success("Trainer deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete trainer");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTrainerDto) => trainingService.createTrainer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      setIsFormOpen(false);
      setEditingTrainer(null);
      toast.success("Trainer created successfully");
    },
    onError: () => {
      toast.error("Failed to create trainer");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTrainerDto> }) =>
      trainingService.updateTrainer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      setIsFormOpen(false);
      setEditingTrainer(null);
      toast.success("Trainer updated successfully");
    },
    onError: () => {
      toast.error("Failed to update trainer");
    },
  });

  const handleAdd = () => {
    setEditingTrainer(null);
    setIsFormOpen(true);
  };

  const handleEdit = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this trainer?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: CreateTrainerDto) => {
    if (editingTrainer) {
      updateMutation.mutate({ id: editingTrainer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading trainers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Trainers</h3>
          <p className="text-sm text-muted-foreground">
            Manage internal and external trainers
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Add01Icon className="size-5" />
          Add Trainer
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Trainer Code</TableHead>
                <TableHead className="min-w-[180px]">Name</TableHead>
                <TableHead className="min-w-[180px]">Email</TableHead>
                <TableHead className="min-w-[120px]">Phone</TableHead>
                <TableHead className="min-w-[100px]">Type</TableHead>
                <TableHead className="min-w-[150px]">Employee</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="text-right min-w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No trainers found
                  </TableCell>
                </TableRow>
              ) : (
                trainers.map((trainer) => (
                  <TableRow key={trainer.id}>
                    <TableCell className="font-medium">{trainer.trainer_code}</TableCell>
                    <TableCell>{trainer.name}</TableCell>
                    <TableCell className="max-w-[180px] truncate" title={trainer.email || ""}>
                      {trainer.email || "-"}
                    </TableCell>
                    <TableCell>{trainer.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={trainer.is_internal ? "default" : "outline"}>
                        {trainer.is_internal ? "Internal" : "External"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {trainer.employee ? trainer.employee.full_name : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={trainer.is_active ? "default" : "secondary"}>
                        {trainer.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontalIcon className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(trainer)}>
                            <Edit01Icon className="size-5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(trainer.id)}
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

      <TrainerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        trainer={editingTrainer}
      />
    </div>
  );
}
