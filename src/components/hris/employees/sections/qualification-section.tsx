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
import { employeeQualificationService } from "@/services/employee-profile.service";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  Edit as Edit01Icon,
  KeyboardArrowDown as ArrowDown01Icon,
  KeyboardArrowUp as ArrowUp01Icon,
  MoreHoriz as MoreHorizontalIcon
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const qualificationSchema = z.object({
  school_university: z.string().min(1, "School/University is required"),
  time_period: z.string().min(1, "Time period is required"),
  education_level: z.string().min(1, "Education level is required"),
});

type QualificationFormData = z.infer<typeof qualificationSchema>;

interface Qualification {
  id: string;
  school_university: string;
  time_period: string;
  education_level: string;
}

interface QualificationSectionProps {
  employeeId: string;
  isEditMode?: boolean;
}

export function QualificationSection({ employeeId, isEditMode = true }: QualificationSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [perPage, setPerPage] = React.useState(10);
  const [sortField, setSortField] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

  const { data: qualificationsData, isLoading } = useQuery({
    queryKey: ["employee-qualifications", employeeId, { search, per_page: perPage }],
    queryFn: () => employeeQualificationService.getAll({ employee_id: employeeId, search, per_page: perPage }),
  });

  const qualifications: Qualification[] = React.useMemo(() => {
    if (!qualificationsData?.data) return [];
    return qualificationsData.data.map((qualification) => ({
      id: qualification.id,
      school_university: qualification.school_name,
      time_period: qualification.time_period,
      education_level: qualification.education_level,
    }));
  }, [qualificationsData]);

  const deleteQualification = useMutation({
    mutationFn: (id: string) => employeeQualificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-qualifications", employeeId] });
      toast.success("Qualification deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete qualification", { description: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<QualificationFormData>({
    resolver: zodResolver(qualificationSchema),
    defaultValues: {
      school_university: "",
      time_period: "",
      education_level: "",
    },
  });

  const filteredQualifications = React.useMemo(() => {
    let filtered = qualifications;
    if (search) {
      filtered = filtered.filter(
        (qual) =>
          qual.school_university.toLowerCase().includes(search.toLowerCase()) ||
          qual.education_level.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered.slice(0, perPage);
  }, [qualifications, search, perPage]);

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
    return (
      <Icon
        className="size-5 ml-1"
      />
    );
  };

  const onSubmit = (data: QualificationFormData) => {
    toast.info("Create/update functionality coming soon");
    setIsAddDialogOpen(false);
    setEditingId(null);
    reset();
  };

  const handleDelete = (id: string) => {
    deleteQualification.mutate(id);
  };

  React.useEffect(() => {
    if (editingId) {
      const qual = qualifications.find((q) => q.id === editingId);
      if (qual) {
        reset(qual);
        setIsAddDialogOpen(true);
      }
    }
  }, [editingId, qualifications, reset]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">All Qualifications</h3>
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
            Add Qualification
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
              <TableHead>School/University</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("time_period")}
                  className="flex items-center hover:text-foreground"
                >
                  Time Period
                  <SortIcon field="time_period" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("education_level")}
                  className="flex items-center hover:text-foreground"
                >
                  Education Level
                  <SortIcon field="education_level" />
                </button>
              </TableHead>
              {isEditMode && <TableHead className="text-right">action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQualifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isEditMode ? 4 : 3} className="h-24 text-center text-muted-foreground">
                  No data available in table
                </TableCell>
              </TableRow>
            ) : (
              filteredQualifications.map((qual) => (
                <TableRow key={qual.id}>
                  <TableCell className="font-medium">{qual.school_university}</TableCell>
                  <TableCell>{qual.time_period}</TableCell>
                  <TableCell>{qual.education_level}</TableCell>
                  {isEditMode && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontalIcon className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingId(qual.id)}>
                            <Edit01Icon className="size-5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(qual.id)}
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
          Showing {filteredQualifications.length > 0 ? 1 : 0} to {filteredQualifications.length} of{" "}
          {qualifications.length} entries
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

      {/* Add/Edit Qualification Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Qualification" : "Add Qualification"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update qualification information"
                : "Add a new qualification for this employee"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="school_university">
                School/University <span className="text-destructive">*</span>
              </Label>
              <Input
                id="school_university"
                {...register("school_university")}
                placeholder="School or University name"
              />
              {errors.school_university && (
                <p className="text-sm text-destructive">
                  {errors.school_university.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_period">
                Time Period <span className="text-destructive">*</span>
              </Label>
              <Input
                id="time_period"
                {...register("time_period")}
                placeholder="e.g., 2015-2019"
              />
              {errors.time_period && (
                <p className="text-sm text-destructive">{errors.time_period.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="education_level">
                Education Level <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("education_level")}
                onValueChange={(value) => setValue("education_level", value || "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High School">High School</SelectItem>
                  <SelectItem value="Associate">Associate</SelectItem>
                  <SelectItem value="Bachelor">Bachelor</SelectItem>
                  <SelectItem value="Master">Master</SelectItem>
                  <SelectItem value="Doctorate">Doctorate</SelectItem>
                  <SelectItem value="Certificate">Certificate</SelectItem>
                </SelectContent>
              </Select>
              {errors.education_level && (
                <p className="text-sm text-destructive">
                  {errors.education_level.message}
                </p>
              )}
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
                {editingId ? "Update" : "Add"} Qualification
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
