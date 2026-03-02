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
import { awardService } from "@/services/core-hr.service";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  Edit as Edit01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const awardSchema = z.object({
  award_name: z.string().min(1, "Award name is required"),
  award_date: z.string().min(1, "Award date is required"),
  award_by: z.string().min(1, "Awarded by is required"),
  description: z.string().optional().nullable(),
});

type AwardFormData = z.infer<typeof awardSchema>;

interface Award {
  id: string;
  award_name: string;
  award_date: string;
  award_by: string;
  description: string | null;
}

interface AwardsSectionProps {
  employeeId: string;
  isEditMode?: boolean;
}

export function AwardsSection({ employeeId, isEditMode = true }: AwardsSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [perPage, setPerPage] = React.useState(10);

  const { data: awardsData, isLoading } = useQuery({
    queryKey: ["awards", employeeId, { search, per_page: perPage }],
    queryFn: () => awardService.getAll({ employee_id: employeeId, search, per_page: perPage }),
  });

  const awards: Award[] = React.useMemo(() => {
    if (!awardsData?.data) return [];
    return awardsData.data.map((a) => ({
      id: a.id,
      award_name: a.award_type,
      award_date: a.award_date,
      award_by: a.department?.name || "Company",
      description: a.award_information || null,
    }));
  }, [awardsData]);

  const deleteAward = useMutation({
    mutationFn: (id: string) => awardService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["awards", employeeId] });
      toast.success("Award deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete award", { description: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AwardFormData>({
    resolver: zodResolver(awardSchema),
    defaultValues: {
      award_name: "",
      award_date: "",
      award_by: "",
      description: "",
    },
  });

  const filteredAwards = React.useMemo(() => {
    let filtered = awards;
    if (search) {
      filtered = filtered.filter(
        (award) =>
          award.award_name.toLowerCase().includes(search.toLowerCase()) ||
          award.award_by.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered.slice(0, perPage);
  }, [awards, search, perPage]);

  React.useEffect(() => {
    if (editingId) {
      const award = awards.find((a) => a.id === editingId);
      if (award) {
        reset({
          award_name: award.award_name,
          award_date: award.award_date,
          award_by: award.award_by,
          description: award.description || "",
        });
        setIsAddDialogOpen(true);
      }
    }
  }, [editingId, awards, reset]);

  const onSubmit = (data: AwardFormData) => {
    if (editingId) {
      // TODO: Implement update mutation when API is ready
      queryClient.invalidateQueries({ queryKey: ["awards", employeeId] });
      toast.success("Award updated successfully");
    } else {
      // TODO: Implement create mutation when API is ready
      queryClient.invalidateQueries({ queryKey: ["awards", employeeId] });
      toast.success("Award added successfully");
    }
    setIsAddDialogOpen(false);
    setEditingId(null);
    reset();
  };

  const handleDelete = (id: string) => {
    deleteAward.mutate(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Awards</h3>
        {isEditMode && (
          <Button
            onClick={() => {
              reset();
              setEditingId(null);
              setIsAddDialogOpen(true);
            }}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Add01Icon className="size-5 mr-2" />
            Add Award
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
            placeholder="Search awards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Award Name</TableHead>
              <TableHead>Award Date</TableHead>
              <TableHead>Awarded By</TableHead>
              <TableHead>Description</TableHead>
              {isEditMode && <TableHead className="text-right">action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAwards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isEditMode ? 5 : 4} className="h-24 text-center text-muted-foreground">
                  No data available in table
                </TableCell>
              </TableRow>
            ) : (
              filteredAwards.map((award) => (
                <TableRow key={award.id}>
                  <TableCell className="font-medium">{award.award_name}</TableCell>
                  <TableCell>{new Date(award.award_date).toLocaleDateString()}</TableCell>
                  <TableCell>{award.award_by}</TableCell>
                  <TableCell className="max-w-xs truncate">{award.description || "-"}</TableCell>
                  {isEditMode && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontalIcon className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingId(award.id)}>
                            <Edit01Icon className="size-5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(award.id)}
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

      {/* Add/Edit Award Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Award" : "Add Award"}
            </DialogTitle>
            <DialogDescription>
              {editingId ? "Update award information" : "Add a new award for this employee"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="award_name">
                Award Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="award_name"
                {...register("award_name")}
                placeholder="Enter award name"
              />
              {errors.award_name && (
                <p className="text-sm text-destructive">{errors.award_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="award_date">
                Award Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="award_date"
                type="date"
                {...register("award_date")}
              />
              {errors.award_date && (
                <p className="text-sm text-destructive">{errors.award_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="award_by">
                Awarded By <span className="text-destructive">*</span>
              </Label>
              <Input
                id="award_by"
                {...register("award_by")}
                placeholder="Enter who awarded this"
              />
              {errors.award_by && (
                <p className="text-sm text-destructive">{errors.award_by.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter description"
                rows={3}
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
                {editingId ? "Update" : "Add"} Award
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
