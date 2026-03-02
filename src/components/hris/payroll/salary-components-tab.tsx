import { salaryComponentService, salaryComponentTypeService } from "@/services/payroll.service";
import type { UpdateSalaryComponentTypeDto } from "@/types/payroll";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import type { CreateSalaryComponentFormData } from "./create-salary-component-form";
import { CreateSalaryComponentForm } from "./create-salary-component-form";
import type { UpdateSalaryComponentFormData } from "./edit-salary-component-form";
import { EditSalaryComponentForm } from "./edit-salary-component-form";
import { EmployeeAllowancesTable } from "./employee-allowances-table";
import { ComponentTypesTable } from "./component-types-table";
import { CreateComponentTypeForm } from "./create-component-type-form";
import { EditComponentTypeForm } from "./edit-component-type-form";
import type { CreateComponentTypeFormData } from "./create-component-type-form";
import type { EditComponentTypeFormData } from "./edit-component-type-form";
import {
  Category as CategoryIcon,
  People as PeopleIcon,
} from "@mui/icons-material";

export function SalaryComponentsTab() {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState("allowances");
  
  // Component Types state
  const [isCreateTypeDialogOpen, setIsCreateTypeDialogOpen] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  
  // Employee Allowances state
  const [isCreateAllowanceDialogOpen, setIsCreateAllowanceDialogOpen] = useState(false);
  const [editingAllowanceId, setEditingAllowanceId] = useState<string | null>(null);

  // Component Types mutations
  const createType = useMutation({
    mutationFn: salaryComponentTypeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaryComponentTypes"] });
      toast.success("Component type created successfully");
      setIsCreateTypeDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to create component type", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const updateType = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSalaryComponentTypeDto;
    }) => salaryComponentTypeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaryComponentTypes"] });
      toast.success("Component type updated successfully");
      setEditingTypeId(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update component type", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const deleteType = useMutation({
    mutationFn: salaryComponentTypeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaryComponentTypes"] });
      toast.success("Component type deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete component type", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  // Employee Allowances mutations
  const createAllowance = useMutation({
    mutationFn: salaryComponentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaryComponents"] });
      toast.success("Employee allowance created successfully");
      setIsCreateAllowanceDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to create employee allowance", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const updateAllowance = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSalaryComponentFormData;
    }) => salaryComponentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaryComponents"] });
      toast.success("Employee allowance updated successfully");
      setEditingAllowanceId(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update employee allowance", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const deleteAllowance = useMutation({
    mutationFn: salaryComponentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaryComponents"] });
      toast.success("Employee allowance deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete employee allowance", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  return (
    <div className="space-y-6">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="allowances" className="flex items-center gap-2">
            <PeopleIcon className="size-5" />
            <span>Employee Allowances</span>
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center gap-2">
            <CategoryIcon className="size-5" />
            <span>Component Types</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="allowances" className="scroll-gutter-stable">
          <EmployeeAllowancesTable
            onAddClick={() => setIsCreateAllowanceDialogOpen(true)}
            onEdit={(id) => setEditingAllowanceId(id)}
            onDelete={(id) => {
              if (confirm("Are you sure you want to delete this employee allowance?")) {
                deleteAllowance.mutate(id);
              }
            }}
            isDeleting={deleteAllowance.isPending}
          />

          <CreateSalaryComponentForm
            open={isCreateAllowanceDialogOpen}
            onOpenChange={setIsCreateAllowanceDialogOpen}
            onSubmit={(data) => createAllowance.mutate(data)}
            isSubmitting={createAllowance.isPending}
          />

          {editingAllowanceId && (
            <EditSalaryComponentForm
              componentId={editingAllowanceId}
              open={!!editingAllowanceId}
              onOpenChange={(open) => !open && setEditingAllowanceId(null)}
              onSubmit={(data) => updateAllowance.mutate({ id: editingAllowanceId, data })}
              isSubmitting={updateAllowance.isPending}
            />
          )}
        </TabsContent>

        <TabsContent value="types" className="scroll-gutter-stable">
          <ComponentTypesTable
            onEdit={(id) => setEditingTypeId(id)}
            onDelete={(id) => {
              if (confirm("Are you sure you want to delete this component type?")) {
                deleteType.mutate(id);
              }
            }}
            onAddClick={() => setIsCreateTypeDialogOpen(true)}
            isDeleting={deleteType.isPending}
          />

          <CreateComponentTypeForm
            open={isCreateTypeDialogOpen}
            onOpenChange={setIsCreateTypeDialogOpen}
            onSubmit={(data) => createType.mutate(data)}
            isSubmitting={createType.isPending}
          />

          {editingTypeId && (
            <EditComponentTypeForm
              typeId={editingTypeId}
              open={!!editingTypeId}
              onOpenChange={(open) => !open && setEditingTypeId(null)}
              onSubmit={(data) => updateType.mutate({ id: editingTypeId, data })}
              isSubmitting={updateType.isPending}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
