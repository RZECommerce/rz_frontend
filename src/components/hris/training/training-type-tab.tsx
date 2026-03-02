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
import type { CreateTrainingTypeDto, TrainingType } from "@/types/training";
import {
    Add as Add01Icon,
    Delete as Delete01Icon,
    Edit as Edit01Icon,
    MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import { TrainingTypeForm } from "./training-type-form";

export function TrainingTypeTab() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingType, setEditingType] = React.useState<TrainingType | null>(null);

  const { data: trainingTypes = [], isLoading } = useQuery({
    queryKey: ["training-types"],
    queryFn: () => trainingService.getTrainingTypes(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => trainingService.deleteTrainingType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-types"] });
      toast.success("Training type deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete training type");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTrainingTypeDto) => trainingService.createTrainingType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-types"] });
      setIsFormOpen(false);
      setEditingType(null);
      toast.success("Training type created successfully");
    },
    onError: () => {
      toast.error("Failed to create training type");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTrainingTypeDto> }) =>
      trainingService.updateTrainingType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-types"] });
      setIsFormOpen(false);
      setEditingType(null);
      toast.success("Training type updated successfully");
    },
    onError: () => {
      toast.error("Failed to update training type");
    },
  });

  const handleAdd = () => {
    setEditingType(null);
    setIsFormOpen(true);
  };

  const handleEdit = (type: TrainingType) => {
    setEditingType(type);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this training type?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: CreateTrainingTypeDto) => {
    if (editingType) {
      updateMutation.mutate({ id: editingType.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading training types...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Training Types</h3>
          <p className="text-sm text-muted-foreground">
            Manage training categories and types
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Add01Icon className="size-5" />
          Add Training Type
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Code</TableHead>
                <TableHead className="min-w-[180px]">Name</TableHead>
                <TableHead className="min-w-[250px]">Description</TableHead>
                <TableHead className="min-w-[100px]">Mandatory</TableHead>
                <TableHead className="min-w-[140px]">Default Duration</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="text-right min-w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainingTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No training types found
                  </TableCell>
                </TableRow>
              ) : (
                trainingTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.training_type_code}</TableCell>
                    <TableCell>{type.name}</TableCell>
                    <TableCell className="max-w-[250px] truncate" title={type.description || ""}>
                      {type.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={type.is_mandatory ? "default" : "outline"}>
                        {type.is_mandatory ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {type.default_duration_hours ? `${type.default_duration_hours} hrs` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={type.is_active ? "default" : "secondary"}>
                        {type.is_active ? "Active" : "Inactive"}
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
                          <DropdownMenuItem onClick={() => handleEdit(type)}>
                            <Edit01Icon className="size-5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(type.id)}
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

      <TrainingTypeForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        trainingType={editingType}
      />
    </div>
  );
}
