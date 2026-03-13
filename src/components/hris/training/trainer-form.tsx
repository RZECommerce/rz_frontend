import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Trainer, CreateTrainerDto } from "@/types/training";
import { useQuery } from "@tanstack/react-query";
import { employeeService } from "@/services/employee.service";

const trainerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  is_internal: z.boolean().default(true),
  employee_id: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  specialties: z.array(z.string()).optional().nullable(),
  is_active: z.boolean().default(true),
});

type TrainerFormData = z.infer<typeof trainerSchema>;

interface TrainerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTrainerDto) => void;
  isSubmitting: boolean;
  trainer?: Trainer | null;
}

export function TrainerForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  trainer,
}: TrainerFormProps) {
  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeService.getAll({ per_page: 9999 }),
  });

  const employees = React.useMemo(() => {
    if (!employeesData) return [];
    if (Array.isArray(employeesData)) return employeesData;
    if (employeesData && typeof employeesData === 'object' && 'data' in employeesData) {
      return employeesData.data || [];
    }
    return [];
  }, [employeesData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema),
    defaultValues: {
      name: trainer?.name || "",
      email: trainer?.email || null,
      phone: trainer?.phone || null,
      is_internal: trainer?.is_internal ?? true,
      employee_id: trainer?.employee_id || null,
      bio: trainer?.bio || null,
      specialties: trainer?.specialties || [],
      is_active: trainer?.is_active ?? true,
    },
  });

  const isInternal = watch("is_internal");

  React.useEffect(() => {
    if (open) {
      reset({
        name: trainer?.name || "",
        email: trainer?.email || null,
        phone: trainer?.phone || null,
        is_internal: trainer?.is_internal ?? true,
        employee_id: trainer?.employee_id || null,
        bio: trainer?.bio || null,
        specialties: trainer?.specialties || [],
        is_active: trainer?.is_active ?? true,
      });
    }
  }, [open, trainer, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto font-sans [&_[data-slot=button][data-variant=outline]]:border-primary/20 [&_[data-slot=button][data-variant=outline]]:hover:bg-primary/5 [&_[data-slot=button][data-variant=ghost]]:hover:bg-primary/5">
        <DialogHeader className="border-b border-border/60 pb-4">
          <DialogTitle>{trainer ? "Edit Trainer" : "Create Trainer"}</DialogTitle>
          <DialogDescription>
            {trainer ? "Update trainer information" : "Add a new trainer (internal or external)"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_internal"
              checked={watch("is_internal")}
              onCheckedChange={(checked) => {
                setValue("is_internal", checked === true);
                if (!checked) {
                  setValue("employee_id", null);
                }
              }}
            />
            <Label htmlFor="is_internal" className="cursor-pointer">
              Internal Trainer (Employee)
            </Label>
          </div>

          {isInternal && (
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee</Label>
              <Controller
                name="employee_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name} ({emp.employee_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={3} {...register("bio")} placeholder="Trainer biography..." />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={watch("is_active")}
              onCheckedChange={(checked) => {
                setValue("is_active", checked === true);
              }}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Active
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : trainer ? "Update" : "Create Trainer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
