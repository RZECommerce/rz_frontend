import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deductionService, deductionTypeService } from "@/services/payroll.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import type { CreateDeductionFormData } from "./create-deduction-form";
import { CreateDeductionForm } from "./create-deduction-form";
import { EmployeeDeductionsTable } from "./employee-deductions-table";
import type { UpdateDeductionFormData } from "./edit-deduction-form";
import { EditDeductionForm } from "./edit-deduction-form";
import { DeductionTypesTable } from "./deduction-types-table";
import {
  Category as CategoryIcon,
  Remove as DeductionIcon,
} from "@mui/icons-material";

export function DeductionsTab() {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState("deductions");
  
  // Deduction Types state
  const [isCreateTypeDialogOpen, setIsCreateTypeDialogOpen] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  
  // Employee Deductions state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDeductionId, setEditingDeductionId] = useState<string | null>(
    null,
  );

  // Deduction Types mutations
  const createType = useMutation({
    mutationFn: deductionTypeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deductionTypes"] });
      toast.success("Deduction type created successfully");
      setIsCreateTypeDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to create deduction type", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const updateType = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      deductionTypeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deductionTypes"] });
      toast.success("Deduction type updated successfully");
      setEditingTypeId(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update deduction type", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const deleteType = useMutation({
    mutationFn: deductionTypeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deductionTypes"] });
      toast.success("Deduction type deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete deduction type", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  // Employee Deductions mutations
  const createDeduction = useMutation({
    mutationFn: deductionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deductions"] });
      toast.success("Deduction created successfully");
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to create deduction", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const updateDeduction = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeductionFormData }) =>
      deductionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deductions"] });
      toast.success("Deduction updated successfully");
      setEditingDeductionId(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update deduction", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const deleteDeduction = useMutation({
    mutationFn: deductionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deductions"] });
      toast.success("Deduction deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete deduction", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const handleEdit = (id: string) => {
    setEditingDeductionId(id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this deduction?")) {
      deleteDeduction.mutate(id);
    }
  };

  const handleSubmitCreate = (data: CreateDeductionFormData) => {
    createDeduction.mutate(data);
  };

  const handleSubmitUpdate = (data: UpdateDeductionFormData) => {
    if (editingDeductionId) {
      updateDeduction.mutate({ id: editingDeductionId, data });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deductions" className="flex items-center gap-2">
            <DeductionIcon className="size-5" />
            <span>Employee Deductions</span>
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center gap-2">
            <CategoryIcon className="size-5" />
            <span>Deduction Types</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deductions" className="scroll-gutter-stable">
          <DeductionTypesTable
            onEdit={(id) => setEditingTypeId(id)}
            onDelete={(id) => {
              if (confirm("Are you sure you want to delete this deduction type?")) {
                deleteType.mutate(id);
              }
            }}
            onAddClick={() => setIsCreateTypeDialogOpen(true)}
            isDeleting={deleteType.isPending}
          />
        </TabsContent>

        <TabsContent value="types" className="scroll-gutter-stable">
          <EmployeeDeductionsTable
            onAddClick={() => setIsCreateDialogOpen(true)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={deleteDeduction.isPending}
          />

          <CreateDeductionForm
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onSubmit={handleSubmitCreate}
            isSubmitting={createDeduction.isPending}
          />

          {editingDeductionId && (
            <EditDeductionForm
              deductionId={editingDeductionId}
              open={!!editingDeductionId}
              onOpenChange={(open) => !open && setEditingDeductionId(null)}
              onSubmit={handleSubmitUpdate}
              isSubmitting={updateDeduction.isPending}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
