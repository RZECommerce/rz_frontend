import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { employeeWorkExperienceService } from "@/services/employee-profile.service";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as Add01Icon,
  KeyboardArrowDown as ArrowDown01Icon,
  KeyboardArrowUp as ArrowUp01Icon,
  Delete as Delete01Icon,
  Edit as Edit01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const workExperienceSchema = z.object({
  company: z.string().min(1, "Company is required"),
  from_date: z.string().min(1, "From date is required"),
  to_date: z.string().optional().nullable(),
  post: z.string().min(1, "Post is required"),
  description: z.string().optional().nullable(),
});

type WorkExperienceFormData = z.infer<typeof workExperienceSchema>;

interface WorkExperience {
  id: string;
  company: string;
  from_date: string;
  to_date: string | null;
  post: string;
  description: string | null;
}

interface WorkExperienceSectionProps {
  employeeId: string;
  isEditMode?: boolean;
}

export function WorkExperienceSection({
  employeeId,
  isEditMode = true,
}: WorkExperienceSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [perPage, setPerPage] = React.useState(10);
  const [sortField, setSortField] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

  const { data: workExperienceData, isLoading } = useQuery({
    queryKey: ["employee-work-experiences", employeeId, { search, per_page: perPage }],
    queryFn: () => employeeWorkExperienceService.getAll({ employee_id: employeeId, search, per_page: perPage }),
  });

  const experiences: WorkExperience[] = React.useMemo(() => {
    if (!workExperienceData?.data) return [];
    return workExperienceData.data.map((experience) => ({
      id: experience.id,
      company: experience.company_name,
      from_date: experience.from_date,
      to_date: experience.to_date ?? null,
      post: experience.post,
      description: experience.description ?? null,
    }));
  }, [workExperienceData]);

  const deleteWorkExperience = useMutation({
    mutationFn: (id: string) => employeeWorkExperienceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-work-experiences", employeeId] });
      toast.success("Work experience deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete work experience", { description: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<WorkExperienceFormData>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: {
      company: "",
      from_date: "",
      to_date: null,
      post: "",
      description: null,
    },
  });

  const filteredExperiences = React.useMemo(() => {
    let filtered = experiences;
    if (search) {
      filtered = filtered.filter(
        (exp) =>
          exp.company.toLowerCase().includes(search.toLowerCase()) ||
          exp.post.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered.slice(0, perPage);
  }, [experiences, search, perPage]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    const Icon = sortDirection === "asc" ? ArrowUp01Icon : ArrowDown01Icon;
    return <Icon className="size-5 ml-1" />;
  };

  const onSubmit = (data: WorkExperienceFormData) => {
    toast.info("Create/update functionality coming soon");
    setIsAddDialogOpen(false);
    setEditingId(null);
    reset();
  };

  const handleDelete = (id: string) => {
    deleteWorkExperience.mutate(id);
  };

  React.useEffect(() => {
    if (editingId) {
      const exp = experiences.find((e) => e.id === editingId);
      if (exp) {
        reset(exp);
        setIsAddDialogOpen(true);
      }
    }
  }, [editingId, experiences, reset]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Work Experience</h3>
        {isEditMode && (
          <Button
            onClick={() => {
              reset();
              setEditingId(null);
              setIsAddDialogOpen(true);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Add01Icon className="size-5 mr-2" />
            Add Work Experience
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex items-center gap-2">
          <Select value={perPage.toString()} onValueChange={(v) => setPerPage(Number(v))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">records per page</span>
        </div>

        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("from_date")}
                  className="flex items-center hover:text-foreground"
                >
                  From Date
                  <SortIcon field="from_date" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("to_date")}
                  className="flex items-center hover:text-foreground"
                >
                  To Date
                  <SortIcon field="to_date" />
                </button>
              </TableHead>
              <TableHead>Post</TableHead>
              <TableHead>Description</TableHead>
              {isEditMode && <TableHead className="text-right">action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExperiences.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isEditMode ? 6 : 5} className="h-24 text-center text-muted-foreground">
                  No data available in table
                </TableCell>
              </TableRow>
            ) : (
              filteredExperiences.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="font-medium">{exp.company}</TableCell>
                  <TableCell>{exp.from_date}</TableCell>
                  <TableCell>{exp.to_date || "Present"}</TableCell>
                  <TableCell>{exp.post}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {exp.description || "-"}
                  </TableCell>
                  {isEditMode && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontalIcon className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingId(exp.id)}>
                            <Edit01Icon className="size-5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(exp.id)}
                            className="text-destructive"
                          >
                            <Delete01Icon className="size-5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredExperiences.length > 0 ? 1 : 0} to {filteredExperiences.length} of{" "}
          {experiences.length} entries
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>

      {/* Add/Edit Work Experience Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Work Experience" : "Add Work Experience"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update work experience information"
                : "Add a new work experience for this employee"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">
                  Company <span className="text-destructive">*</span>
                </Label>
                <Input id="company" {...register("company")} placeholder="Company name" />
                {errors.company && (
                  <p className="text-sm text-destructive">{errors.company.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="post">
                  Post <span className="text-destructive">*</span>
                </Label>
                <Input id="post" {...register("post")} placeholder="Job title/position" />
                {errors.post && (
                  <p className="text-sm text-destructive">{errors.post.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_date">
                  From Date <span className="text-destructive">*</span>
                </Label>
                <Input id="from_date" type="date" {...register("from_date")} />
                {errors.from_date && (
                  <p className="text-sm text-destructive">{errors.from_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="to_date">To Date</Label>
                <Input id="to_date" type="date" {...register("to_date")} />
                <p className="text-xs text-muted-foreground">
                  Leave empty if currently working here
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Job responsibilities and achievements"
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingId(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Update" : "Add"} Work Experience
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
