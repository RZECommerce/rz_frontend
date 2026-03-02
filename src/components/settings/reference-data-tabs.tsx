
import { SettingsForm } from "@/components/settings/settings-form";
import { SettingsTable } from "@/components/settings/settings-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHasPermission } from "@/hooks/use-permissions";
import {
    departmentService,
    employmentTypeService,
    positionService,
} from "@/services/employee.service";
import type { Department, EmploymentType, Position } from "@/types/employee";
import { Add as Add01Icon, KeyboardArrowDown as ArrowDown01Icon } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type FormData = {
  name: string;
  description?: string;
  is_active: boolean;
};

export function ReferenceDataTabs() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "departments" | "positions" | "employment-types"
  >("departments");
  const [editingItem, setEditingItem] = useState<
    Department | Position | EmploymentType | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: departmentsData, isLoading: departmentsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getAll(),
  });

  const { data: positionsData, isLoading: positionsLoading } = useQuery({
    queryKey: ["positions"],
    queryFn: () => positionService.getAll(),
  });

  const { data: employmentTypesData, isLoading: employmentTypesLoading } =
    useQuery({
      queryKey: ["employmentTypes"],
      queryFn: () => employmentTypeService.getAll(),
    });

  const createDepartment = useMutation({
    mutationFn: (data: FormData) => departmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department created successfully.");
      setIsDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to create department.", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });

  const updateDepartment = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FormData> }) =>
      departmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department updated successfully.");
      setIsDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update department.", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });

  const deleteDepartment = useMutation({
    mutationFn: departmentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department deleted successfully.");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete department.", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });

  const createPosition = useMutation({
    mutationFn: (data: FormData) => positionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Position created successfully.");
      setIsDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to create position.", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });

  const updatePosition = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FormData> }) =>
      positionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Position updated successfully.");
      setIsDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update position.", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });

  const deletePosition = useMutation({
    mutationFn: positionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Position deleted successfully.");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete position.", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });

  const createEmploymentType = useMutation({
    mutationFn: (data: FormData) => employmentTypeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employmentTypes"] });
      toast.success("Employment type created successfully.");
      setIsDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to create employment type.", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });

  const updateEmploymentType = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FormData> }) =>
      employmentTypeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employmentTypes"] });
      toast.success("Employment type updated successfully.");
      setIsDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update employment type.", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });

  const deleteEmploymentType = useMutation({
    mutationFn: employmentTypeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employmentTypes"] });
      toast.success("Employment type deleted successfully.");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete employment type.", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });

  useEffect(() => {
    setEditingItem(null);
    setIsDialogOpen(false);
  }, [activeTab]);

  const openCreateDialog = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleNewDepartment = () => {
    setActiveTab("departments");
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleNewPosition = () => {
    setActiveTab("positions");
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: Department | Position | EmploymentType) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: FormData) => {
    if (activeTab === "departments") {
      if (editingItem) {
        updateDepartment.mutate({ id: editingItem.id, data });
      } else {
        createDepartment.mutate(data);
      }
    } else if (activeTab === "positions") {
      if (editingItem) {
        updatePosition.mutate({ id: editingItem.id, data });
      } else {
        createPosition.mutate(data);
      }
    } else {
      if (editingItem) {
        updateEmploymentType.mutate({ id: editingItem.id, data });
      } else {
        createEmploymentType.mutate(data);
      }
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      if (activeTab === "departments") {
        deleteDepartment.mutate(id);
      } else if (activeTab === "positions") {
        deletePosition.mutate(id);
      } else {
        deleteEmploymentType.mutate(id);
      }
    }
  };

  const currentData =
    activeTab === "departments"
      ? (departmentsData as Department[]) || []
      : activeTab === "positions"
        ? (positionsData as Position[]) || []
        : (employmentTypesData as EmploymentType[]) || [];

  const currentLoading =
    activeTab === "departments"
      ? departmentsLoading
      : activeTab === "positions"
        ? positionsLoading
        : employmentTypesLoading;

  const isSubmitting =
    activeTab === "departments"
      ? createDepartment.isPending || updateDepartment.isPending
      : activeTab === "positions"
        ? createPosition.isPending || updatePosition.isPending
        : createEmploymentType.isPending || updateEmploymentType.isPending;

  const canManage = useHasPermission("settings.manage");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Reference Data</h3>
          <p className="text-sm text-muted-foreground">
            Manage departments, positions, and employment types
          </p>
        </div>
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="gap-2">
                <Add01Icon className="size-5" />
                New
                <ArrowDown01Icon className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleNewDepartment}>
                New Department
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNewPosition}>
                New Position
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="employment-types">Employment Types</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="mt-6">
          <SettingsTable
            activeTab={activeTab}
            data={currentData}
            isLoading={currentLoading}
            onEdit={openEditDialog}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="positions" className="mt-6">
          <SettingsTable
            activeTab={activeTab}
            data={currentData}
            isLoading={currentLoading}
            onEdit={openEditDialog}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="employment-types" className="mt-6">
          <SettingsTable
            activeTab={activeTab}
            data={currentData}
            isLoading={currentLoading}
            onEdit={openEditDialog}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>

      <SettingsForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        activeTab={activeTab}
        editingItem={editingItem}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

