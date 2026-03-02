import { CreateSalaryComponentForm } from "@/components/hris/payroll/create-salary-component-form";
import { EditSalaryComponentForm } from "@/components/hris/payroll/edit-salary-component-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { salaryComponentService } from "@/services/payroll.service";
import type {
  CreateSalaryComponentDto,
  SalaryComponent,
  UpdateSalaryComponentDto,
} from "@/types/payroll";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  Edit as Edit01Icon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface EmployeeSalaryComponentsProps {
  employeeId: string;
}

export function EmployeeSalaryComponents({
  employeeId,
}: EmployeeSalaryComponentsProps) {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<string | null>(null);

  const { data: componentsData, isLoading } = useQuery({
    queryKey: ["salaryComponents", { employee_id: employeeId }],
    queryFn: () => salaryComponentService.getAll({ employee_id: employeeId }),
  });

  const components = (componentsData?.data || []).filter(
    (comp: SalaryComponent) => comp.employee_id === employeeId
  );

  const deleteComponent = useMutation({
    mutationFn: salaryComponentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaryComponents"] });
    },
  });

  const createComponent = useMutation({
    mutationFn: salaryComponentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaryComponents"] });
      setIsCreateDialogOpen(false);
    },
  });

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCreate = (data: CreateSalaryComponentDto) => {
    createComponent.mutate({ ...data, employee_id: employeeId });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <CardTitle className="text-lg">Salary Components</CardTitle>
            <CardDescription>
              Manage allowances, bonuses, and other salary components for this
              employee
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-2"
          >
            <Add01Icon className="size-5" />
            Add Component
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-24 flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : components.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-muted-foreground">
            No salary components found. Click "Add Component" to create one.
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {components.map((component: SalaryComponent) => (
                  <TableRow key={component.id}>
                    <TableCell className="font-medium">
                      {component.name}
                    </TableCell>
                    <TableCell>{component.component_type}</TableCell>
                    <TableCell>{formatCurrency(component.amount)}</TableCell>
                    <TableCell>
                      {formatDate(component.effective_date)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${component.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }`}
                      >
                        {component.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingComponent(component.id)}
                        >
                          <Edit01Icon className="size-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this component?"
                              )
                            ) {
                              deleteComponent.mutate(component.id);
                            }
                          }}
                        >
                          <Delete01Icon
                            className="size-5 text-destructive"
                          />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <CreateSalaryComponentForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreate}
        isSubmitting={createComponent.isPending}
        defaultEmployeeId={employeeId}
      />

      {editingComponent && (
        <EditSalaryComponentForm
          componentId={editingComponent}
          open={!!editingComponent}
          onOpenChange={(open: boolean) => !open && setEditingComponent(null)}
          onSubmit={(data: UpdateSalaryComponentDto) => {
            salaryComponentService.update(editingComponent, data);
            setEditingComponent(null);
          }}
          isSubmitting={false}
        />
      )}
    </Card>
  );
}
