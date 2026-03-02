import { payrollPeriodService } from "@/services/payroll.service";
import type {
  CreatePayrollPeriodDto,
  UpdatePayrollPeriodDto,
} from "@/types/payroll";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CreatePayrollPeriodForm } from "./create-payroll-period-form";
import { EditPayrollPeriodForm } from "./edit-payroll-period-form";
import { PayrollPeriodsTable } from "./payroll-periods-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarMonth as CalendarIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

export function PayrollPeriodsTab() {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState("periods");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);

  const createPeriod = useMutation({
    mutationFn: payrollPeriodService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrollPeriods"] });
      toast.success("Payroll period created successfully");
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to create payroll period", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const updatePeriod = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePayrollPeriodDto }) =>
      payrollPeriodService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrollPeriods"] });
      toast.success("Payroll period updated successfully");
      setEditingPeriodId(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update payroll period", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const deletePeriod = useMutation({
    mutationFn: payrollPeriodService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrollPeriods"] });
      toast.success("Payroll period deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete payroll period", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const handleEdit = (id: string) => {
    setEditingPeriodId(id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this payroll period?")) {
      deletePeriod.mutate(id);
    }
  };

  const handleSubmitCreate = (data: CreatePayrollPeriodDto) => {
    createPeriod.mutate(data);
  };

  const handleSubmitUpdate = (data: UpdatePayrollPeriodDto) => {
    if (editingPeriodId) {
      updatePeriod.mutate({ id: editingPeriodId, data });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="periods" className="flex items-center gap-2">
            <CalendarIcon className="size-5" />
            <span>Payroll Periods</span>
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <InfoIcon className="size-5" />
            <span>Information</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="periods" className="scroll-gutter-stable">
          <PayrollPeriodsTable
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddClick={() => setIsCreateDialogOpen(true)}
          />
        </TabsContent>

        <TabsContent value="info" className="scroll-gutter-stable">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Payroll Period Information</h2>
              <p className="text-muted-foreground">
                Understanding Philippine DOLE-compliant payroll periods and payment schedules
              </p>
            </div>

            <div className="grid gap-6">
              {/* Semi-Monthly */}
              <div className="rounded-lg border bg-card p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                    <CalendarIcon className="size-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">Semi-Monthly (Recommended)</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Most common in the Philippines - complies with Labor Code Article 103
                    </p>
                    
                    <div className="space-y-3">
                      <div className="rounded-md bg-muted p-4">
                        <div className="font-semibold mb-2">First Half</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Period:</span>
                            <span className="ml-2 font-medium">1st - 15th of the month</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pay Date:</span>
                            <span className="ml-2 font-medium">20th of the same month</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="rounded-md bg-muted p-4">
                        <div className="font-semibold mb-2">Second Half</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Period:</span>
                            <span className="ml-2 font-medium">16th - Last day of month</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pay Date:</span>
                            <span className="ml-2 font-medium">5th of next month</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        <strong>Legal Basis:</strong> Labor Code Article 103 requires wages to be paid at least twice a month with no more than 16 days interval. Payment must be made within 5 days after the end of each period.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly */}
              <div className="rounded-lg border bg-card p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                    <CalendarIcon className="size-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">Monthly</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Common for salaried employees and management positions
                    </p>
                    
                    <div className="rounded-md bg-muted p-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Period:</span>
                          <span className="ml-2 font-medium">1st - Last day of the month</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pay Date:</span>
                          <span className="ml-2 font-medium">5th of next month</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-900 dark:text-green-100">
                        <strong>Common Practice:</strong> Monthly payroll is typically used for managerial and professional employees. Payment is usually made on the last working day of the month or within the first 5 days of the following month.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly */}
              <div className="rounded-lg border bg-card p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
                    <CalendarIcon className="size-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">Weekly</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Common for daily-paid workers and construction industry
                    </p>
                    
                    <div className="rounded-md bg-muted p-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Period:</span>
                          <span className="ml-2 font-medium">Monday - Sunday (7 days)</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pay Date:</span>
                          <span className="ml-2 font-medium">Following Friday</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 rounded-md bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-purple-900 dark:text-purple-100">
                        <strong>Legal Requirement:</strong> Weekly wages must be paid within 7 days after the end of the work week. This is commonly used for workers paid on a daily or hourly basis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bi-Weekly */}
              <div className="rounded-lg border bg-card p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-2">
                    <CalendarIcon className="size-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">Bi-Weekly</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Less common in the Philippines but used by some companies
                    </p>
                    
                    <div className="rounded-md bg-muted p-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Period:</span>
                          <span className="ml-2 font-medium">14 days (Monday - Sunday)</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pay Date:</span>
                          <span className="ml-2 font-medium">Following Friday</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 rounded-md bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                      <p className="text-sm text-orange-900 dark:text-orange-100">
                        <strong>Note:</strong> Bi-weekly payroll covers a 14-day period. Payment must be made within 7 days after the period ends, similar to weekly payroll requirements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* General Information */}
            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-6">
              <h3 className="text-lg font-semibold mb-3">Important Reminders</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>All payroll periods are calculated according to Philippine Labor Code requirements</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Payment dates are automatically calculated based on the period type and common PH practices</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Semi-monthly is the most common and recommended period type in the Philippines</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Ensure compliance with your company's CBA (Collective Bargaining Agreement) if applicable</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Payment delays beyond the legal timeframe may result in penalties under the Labor Code</span>
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <CreatePayrollPeriodForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleSubmitCreate}
        isSubmitting={createPeriod.isPending}
      />

      {editingPeriodId && (
        <EditPayrollPeriodForm
          periodId={editingPeriodId}
          open={!!editingPeriodId}
          onOpenChange={(open) => !open && setEditingPeriodId(null)}
          onSubmit={handleSubmitUpdate}
          isSubmitting={updatePeriod.isPending}
        />
      )}
    </div>
  );
}
