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
import { complaintService } from "@/services/core-hr.service";
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

const complaintSchema = z.object({
  complaint_date: z.string().min(1, "Complaint date is required"),
  complaint_from: z.string().min(1, "Complaint from is required"),
  complaint_against: z.string().min(1, "Complaint against is required"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["pending", "investigating", "resolved", "dismissed"]),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

interface Complaint {
  id: string;
  complaint_date: string;
  complaint_from: string;
  complaint_against: string;
  subject: string;
  description: string;
  status: "pending" | "investigating" | "resolved" | "dismissed";
}

interface ComplaintsSectionProps {
  employeeId: string;
  isEditMode?: boolean;
}

export function ComplaintsSection({ employeeId, isEditMode = true }: ComplaintsSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [perPage, setPerPage] = React.useState(10);

  const { data: complaintsData, isLoading } = useQuery({
    queryKey: ["complaints", employeeId, { search, per_page: perPage }],
    queryFn: () => complaintService.getAll({ employee_id: employeeId, search, per_page: perPage }),
  });

  const complaints: Complaint[] = React.useMemo(() => {
    if (!complaintsData?.data) return [];
    return complaintsData.data.map((c: any) => {
      return {
        id: c.id as string,
        complaint_date: c.complaint_date as string,
        complaint_from: (c.complaint_from_name as string) || String(c.complaint_from || "Unknown"),
        complaint_against: (c.complaint_against_name as string) || String(c.complaint_against || "Unknown"),
        subject: (c.complaint_title as string) || (c.description as string)?.substring(0, 50) || "Complaint",
        description: (c.description as string) || "",
        status: (c.status as Complaint["status"]) || "pending",
      };
    });
  }, [complaintsData]);

  const deleteComplaint = useMutation({
    mutationFn: (id: string) => complaintService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints", employeeId] });
      toast.success("Complaint deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete complaint", { description: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      complaint_date: "",
      complaint_from: "",
      complaint_against: "",
      subject: "",
      description: "",
      status: "pending",
    },
  });

  const filteredComplaints = React.useMemo(() => {
    let filtered = complaints;
    if (search) {
      filtered = filtered.filter(
        (complaint) =>
          complaint.subject.toLowerCase().includes(search.toLowerCase()) ||
          complaint.complaint_from.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered.slice(0, perPage);
  }, [complaints, search, perPage]);

  React.useEffect(() => {
    if (editingId) {
      const complaint = complaints.find((c) => c.id === editingId);
      if (complaint) {
        reset({
          complaint_date: complaint.complaint_date,
          complaint_from: complaint.complaint_from,
          complaint_against: complaint.complaint_against,
          subject: complaint.subject,
          description: complaint.description,
          status: complaint.status,
        });
        setIsAddDialogOpen(true);
      }
    }
  }, [editingId, complaints, reset]);

  const onSubmit = (data: ComplaintFormData) => {
    toast.info("Create/update functionality coming soon");
    setIsAddDialogOpen(false);
    setEditingId(null);
    reset();
  };

  const handleDelete = (id: string) => {
    deleteComplaint.mutate(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Complaint Records</h3>
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
            Add Complaint
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
            placeholder="Search complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Complaint Date</TableHead>
              <TableHead>From</TableHead>
              <TableHead>Against</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              {isEditMode && <TableHead className="text-right">action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComplaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isEditMode ? 6 : 5} className="h-24 text-center text-muted-foreground">
                  No data available in table
                </TableCell>
              </TableRow>
            ) : (
              filteredComplaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell>{new Date(complaint.complaint_date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{complaint.complaint_from}</TableCell>
                  <TableCell className="font-medium">{complaint.complaint_against}</TableCell>
                  <TableCell>{complaint.subject}</TableCell>
                  <TableCell>
                    <span className="capitalize">{complaint.status}</span>
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
                          <DropdownMenuItem onClick={() => setEditingId(complaint.id)}>
                            <Edit01Icon className="size-5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(complaint.id)}
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Complaint" : "Add Complaint"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update complaint information" : "Add a new complaint record"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="complaint_date">
                Complaint Date <span className="text-destructive">*</span>
              </Label>
              <Input id="complaint_date" type="date" {...register("complaint_date")} />
              {errors.complaint_date && (
                <p className="text-sm text-destructive">{errors.complaint_date.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="complaint_from">
                  Complaint From <span className="text-destructive">*</span>
                </Label>
                <Input id="complaint_from" {...register("complaint_from")} placeholder="Enter name" />
                {errors.complaint_from && (
                  <p className="text-sm text-destructive">{errors.complaint_from.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="complaint_against">
                  Complaint Against <span className="text-destructive">*</span>
                </Label>
                <Input id="complaint_against" {...register("complaint_against")} placeholder="Enter name" />
                {errors.complaint_against && (
                  <p className="text-sm text-destructive">{errors.complaint_against.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Input id="subject" {...register("subject")} placeholder="Enter subject" />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter description"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
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
              <Button type="submit">{editingId ? "Update" : "Add"} Complaint</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
