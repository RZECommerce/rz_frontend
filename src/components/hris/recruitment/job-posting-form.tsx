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
import type { JobPosting, CreateJobPostingDto } from "@/types/recruitment";
import { useQuery } from "@tanstack/react-query";
import { departmentService, positionService, employmentTypeService } from "@/services/employee.service";

const jobPostingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  department_id: z.string().optional().nullable(),
  position_id: z.string().optional().nullable(),
  employment_type_id: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  salary_min: z.number().optional().nullable(),
  salary_max: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "closed"]).default("draft"),
  posted_date: z.string().optional().nullable(),
  closing_date: z.string().optional().nullable(),
  requirements: z.string().optional().nullable(),
  benefits: z.string().optional().nullable(),
});

type JobPostingFormData = z.infer<typeof jobPostingSchema>;

interface JobPostingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateJobPostingDto) => void;
  isSubmitting: boolean;
  jobPosting?: JobPosting | null;
}

export function JobPostingForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  jobPosting,
}: JobPostingFormProps) {
  const { data: departmentsData } = useQuery({
    queryKey: ["departments", { activeOnly: true }],
    queryFn: () => departmentService.getAll(true),
  });

  const { data: positionsData } = useQuery({
    queryKey: ["positions", { activeOnly: true }],
    queryFn: () => positionService.getAll(true),
  });

  const { data: employmentTypesData } = useQuery({
    queryKey: ["employmentTypes", { activeOnly: true }],
    queryFn: () => employmentTypeService.getAll(true),
  });

  const departments = React.useMemo(() => {
    if (!departmentsData) return [];
    if (Array.isArray(departmentsData)) return departmentsData;
    if (departmentsData && typeof departmentsData === 'object' && 'data' in departmentsData) {
      const data = (departmentsData as { data: unknown }).data;
      return Array.isArray(data) ? data : [];
    }
    return [];
  }, [departmentsData]);

  const positions = React.useMemo(() => {
    if (!positionsData) return [];
    if (Array.isArray(positionsData)) return positionsData;
    if (positionsData && typeof positionsData === 'object' && 'data' in positionsData) {
      const data = (positionsData as { data: unknown }).data;
      return Array.isArray(data) ? data : [];
    }
    return [];
  }, [positionsData]);

  const employmentTypes = React.useMemo(() => {
    if (!employmentTypesData) return [];
    if (Array.isArray(employmentTypesData)) return employmentTypesData;
    if (employmentTypesData && typeof employmentTypesData === 'object' && 'data' in employmentTypesData) {
      const data = (employmentTypesData as { data: unknown }).data;
      return Array.isArray(data) ? data : [];
    }
    return [];
  }, [employmentTypesData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: jobPosting?.title || "",
      description: jobPosting?.description || null,
      department_id: jobPosting?.department_id || null,
      position_id: jobPosting?.position_id || null,
      employment_type_id: jobPosting?.employment_type_id || null,
      location: jobPosting?.location || null,
      salary_min: jobPosting?.salary_min || null,
      salary_max: jobPosting?.salary_max || null,
      currency: jobPosting?.currency || "PHP",
      status: jobPosting?.status || "draft",
      posted_date: jobPosting?.posted_date || null,
      closing_date: jobPosting?.closing_date || null,
      requirements: jobPosting?.requirements || null,
      benefits: jobPosting?.benefits || null,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        title: jobPosting?.title || "",
        description: jobPosting?.description || null,
        department_id: jobPosting?.department_id || null,
        position_id: jobPosting?.position_id || null,
        employment_type_id: jobPosting?.employment_type_id || null,
        location: jobPosting?.location || null,
        salary_min: jobPosting?.salary_min || null,
        salary_max: jobPosting?.salary_max || null,
        currency: jobPosting?.currency || "PHP",
        status: jobPosting?.status || "draft",
        posted_date: jobPosting?.posted_date || null,
        closing_date: jobPosting?.closing_date || null,
        requirements: jobPosting?.requirements || null,
        benefits: jobPosting?.benefits || null,
      });
    }
  }, [open, jobPosting, reset]);

  const selectedDepartment = React.useMemo(
    () => departments.find((dept) => dept.id === watch("department_id")),
    [departments, watch("department_id")]
  );

  const selectedPosition = React.useMemo(
    () => positions.find((pos) => pos.id === watch("position_id")),
    [positions, watch("position_id")]
  );

  const selectedEmploymentType = React.useMemo(
    () => employmentTypes.find((type) => type.id === watch("employment_type_id")),
    [employmentTypes, watch("employment_type_id")]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{jobPosting ? "Edit Job Posting" : "Create Job Posting"}</DialogTitle>
          <DialogDescription>
            {jobPosting
              ? "Update job posting details"
              : "Create a new job posting for recruitment"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Job Title <span className="text-destructive">*</span>
            </Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              {...register("description")}
              placeholder="Job description..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department_id">Department</Label>
              <Controller
                name="department_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department">
                        {selectedDepartment ? selectedDepartment.name : "Select department"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position_id">Position</Label>
              <Controller
                name="position_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position">
                        {selectedPosition ? selectedPosition.name : "Select position"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {positions.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employment_type_id">Employment Type</Label>
              <Controller
                name="employment_type_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type">
                        {selectedEmploymentType ? selectedEmploymentType.name : "Select type"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {employmentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} placeholder="e.g., Manila, Philippines" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_min">Min Salary</Label>
              <Input
                id="salary_min"
                type="number"
                step="0.01"
                {...register("salary_min", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_max">Max Salary</Label>
              <Input
                id="salary_max"
                type="number"
                step="0.01"
                {...register("salary_max", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" {...register("currency")} placeholder="PHP" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="posted_date">Posted Date</Label>
              <Input id="posted_date" type="date" {...register("posted_date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closing_date">Closing Date</Label>
              <Input id="closing_date" type="date" {...register("closing_date")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              rows={4}
              {...register("requirements")}
              placeholder="Job requirements..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits</Label>
            <Textarea
              id="benefits"
              rows={4}
              {...register("benefits")}
              placeholder="Job benefits..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : jobPosting ? "Update" : "Create Job Posting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
