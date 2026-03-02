import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { employeeService } from "@/services/employee.service";
import type { Travel, CreateTravelDto } from "@/types/core-hr";

const travelSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  arrangement_type: z.string().optional().nullable(),
  place_of_visit: z.string().min(1, "Place of visit is required"),
  purpose_of_visit: z.string().min(1, "Purpose of visit is required"),
  description: z.string().optional().nullable(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  expected_budget: z.number().optional().nullable(),
  actual_budget: z.number().optional().nullable(),
  travel_mode: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
  message: "End date must be after start date",
  path: ["end_date"],
});

type TravelFormData = z.infer<typeof travelSchema>;

interface TravelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Travel | null;
  onSubmit: (data: CreateTravelDto) => void;
  isSubmitting: boolean;
}

export function TravelForm({ open, onOpenChange, editingItem, onSubmit, isSubmitting }: TravelFormProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<TravelFormData>({
    resolver: zodResolver(travelSchema),
    defaultValues: {
      employee_id: "",
      arrangement_type: null,
      place_of_visit: "",
      purpose_of_visit: "",
      description: null,
      start_date: "",
      end_date: "",
      expected_budget: null,
      actual_budget: null,
      travel_mode: null,
      status: null,
    },
  });

  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeService.getAll({ per_page: 9999 }),
  });

  React.useEffect(() => {
    if (open) {
      if (editingItem) {
        reset({
          employee_id: editingItem.employee_id,
          arrangement_type: editingItem.arrangement_type || null,
          place_of_visit: editingItem.place_of_visit,
          purpose_of_visit: editingItem.purpose_of_visit,
          description: editingItem.description || null,
          start_date: editingItem.start_date,
          end_date: editingItem.end_date,
          expected_budget: editingItem.expected_budget || null,
          actual_budget: editingItem.actual_budget || null,
          travel_mode: editingItem.travel_mode || null,
          status: editingItem.status || null,
        });
      } else {
        reset({
          employee_id: "",
          arrangement_type: null,
          place_of_visit: "",
          purpose_of_visit: "",
          description: null,
          start_date: "",
          end_date: "",
          expected_budget: null,
          actual_budget: null,
          travel_mode: null,
          status: null,
        });
      }
    }
  }, [open, editingItem, reset]);

  const employees = employeesData?.data || [];

  const selectedEmployee = React.useMemo(
    () => employees.find((emp) => emp.id === watch("employee_id")),
    [employees, watch("employee_id")]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Edit Travel" : "Add Travel"}</DialogTitle>
          <DialogDescription>{editingItem ? "Update travel information" : "Add a new travel record"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee_id">Employee <span className="text-destructive">*</span></Label>
            <Select value={watch("employee_id")} onValueChange={(value) => setValue("employee_id", value || "", { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Employee...">
                  {selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : "Select Employee..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>{employees.map((employee) => (<SelectItem key={employee.id} value={employee.id}>{employee.first_name} {employee.last_name}</SelectItem>))}</SelectContent>
            </Select>
            {errors.employee_id && <p className="text-sm text-destructive">{errors.employee_id.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arrangement_type">Arrangement Type</Label>
              <Select value={watch("arrangement_type") || ""} onValueChange={(value) => setValue("arrangement_type", value || null)}>
                <SelectTrigger><SelectValue placeholder="Select Arrangement..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="Company Arranged">Company Arranged</SelectItem>
                  <SelectItem value="Employee Arranged">Employee Arranged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="travel_mode">Travel Mode</Label>
              <Select value={watch("travel_mode") || ""} onValueChange={(value) => setValue("travel_mode", value || null)}>
                <SelectTrigger><SelectValue placeholder="Travel Mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="Air">Air</SelectItem>
                  <SelectItem value="Train">Train</SelectItem>
                  <SelectItem value="Bus">Bus</SelectItem>
                  <SelectItem value="Car">Car</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="place_of_visit">Place Of Visit <span className="text-destructive">*</span></Label>
              <Input id="place_of_visit" {...register("place_of_visit")} placeholder="Place Of Visit" />
              {errors.place_of_visit && <p className="text-sm text-destructive">{errors.place_of_visit.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose_of_visit">Purpose Of Visit <span className="text-destructive">*</span></Label>
              <Input id="purpose_of_visit" {...register("purpose_of_visit")} placeholder="Purpose Of Visit" />
              {errors.purpose_of_visit && <p className="text-sm text-destructive">{errors.purpose_of_visit.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} placeholder="Description" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date <span className="text-destructive">*</span></Label>
              <Input id="start_date" type="date" {...register("start_date")} />
              {errors.start_date && <p className="text-sm text-destructive">{errors.start_date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date <span className="text-destructive">*</span></Label>
              <Input id="end_date" type="date" {...register("end_date")} />
              {errors.end_date && <p className="text-sm text-destructive">{errors.end_date.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expected_budget">Expected Budget</Label>
              <Input id="expected_budget" type="number" step="0.01" {...register("expected_budget", { valueAsNumber: true })} placeholder="Expected Budget" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual_budget">Actual Budget</Label>
              <Input id="actual_budget" type="number" step="0.01" {...register("actual_budget", { valueAsNumber: true })} placeholder="Actual Budget" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={watch("status") || ""} onValueChange={(value) => setValue("status", value || null)}>
              <SelectTrigger><SelectValue placeholder="Select Status..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : editingItem ? "Update" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
