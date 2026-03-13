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
import { employeeDocumentService } from "@/services/employee-document.service";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as AddIcon,
  ArrowDownward as ArrowDownIcon,
  ArrowUpward as ArrowUpIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreHoriz as MoreHorizontalIcon
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const immigrationSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  issue_date: z.string().min(1, "Issue date is required"),
  expiry_date: z.string().optional().nullable(),
  issue_by: z.string().min(1, "Issue by is required"),
  review_date: z.string().optional().nullable(),
  file: z.instanceof(File).optional(),
});

type ImmigrationFormData = z.infer<typeof immigrationSchema>;

interface ImmigrationSectionProps {
  employeeId: string;
  isEditMode?: boolean;
}

export function ImmigrationSection({ employeeId, isEditMode = true }: ImmigrationSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [perPage, setPerPage] = React.useState(10);
  const [sortField, setSortField] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

  const { data: documentsData, isLoading } = useQuery({
    queryKey: ["employee-documents", employeeId, { category: "immigration", search, per_page: perPage }],
    queryFn: () =>
      employeeDocumentService.getByEmployee(employeeId, {
        category: "immigration",
        search,
        per_page: perPage,
      }),
  });

  const documents = React.useMemo(() => {
    if (!documentsData) return [];
    if (Array.isArray(documentsData)) return documentsData;
    if ("data" in documentsData) return documentsData.data || [];
    return [];
  }, [documentsData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ImmigrationFormData>({
    resolver: zodResolver(immigrationSchema),
    defaultValues: {
      name: "",
      issue_date: "",
      expiry_date: null,
      issue_by: "",
      review_date: null,
    },
  });

  const createDocument = useMutation({
    mutationFn: async (data: ImmigrationFormData) => {
      const formData = new FormData();
      formData.append("employee_id", employeeId);
      formData.append("name", data.name);
      formData.append("category", "immigration");
      formData.append("expiry_date", data.expiry_date || "");
      // Store immigration-specific fields in description as JSON
      const description = JSON.stringify({
        issue_date: data.issue_date,
        issue_by: data.issue_by,
        review_date: data.review_date,
      });
      formData.append("description", description);
      if (data.file) {
        formData.append("file", data.file);
      }
      return employeeDocumentService.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-documents", employeeId] });
      toast.success("Immigration document added successfully");
      setIsAddDialogOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error("Failed to add immigration document", {
        description: error.message,
      });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: (id: string) => employeeDocumentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-documents", employeeId] });
      toast.success("Immigration document deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete immigration document", {
        description: error.message,
      });
    },
  });

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
    return (
      <div className="flex items-center">
        {sortDirection === "asc" ? <ArrowUpIcon className="size-5 ml-1" /> : <ArrowDownIcon className="size-5 ml-1" />}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Assigned Immigration</h3>
        {isEditMode && (
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <AddIcon className="size-5 mr-2" />
            Add Immigration
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
              <TableHead>
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center hover:text-foreground"
                >
                  Document
                  <SortIcon field="name" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("created_at")}
                  className="flex items-center hover:text-foreground"
                >
                  Issue Date
                  <SortIcon field="created_at" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("expiry_date")}
                  className="flex items-center hover:text-foreground"
                >
                  Expired Date
                  <SortIcon field="expiry_date" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("issue_by")}
                  className="flex items-center hover:text-foreground"
                >
                  Issue By
                  <SortIcon field="issue_by" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("review_date")}
                  className="flex items-center hover:text-foreground"
                >
                  Review Date
                  <SortIcon field="review_date" />
                </button>
              </TableHead>
              {isEditMode && <TableHead className="text-right">action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isEditMode ? 6 : 5} className="h-24 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isEditMode ? 6 : 5} className="h-24 text-center text-muted-foreground">
                  No data available in table
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc: any) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>
                    {doc.created_at
                      ? format(new Date(doc.created_at), "MM/dd/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {doc.expiry_date
                      ? format(new Date(doc.expiry_date), "MM/dd/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      try {
                        const desc = doc.description
                          ? JSON.parse(doc.description)
                          : {};
                        return desc?.issue_by || "-";
                      } catch {
                        return "-";
                      }
                    })()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      try {
                        const desc = doc.description
                          ? JSON.parse(doc.description)
                          : {};
                        return desc?.review_date
                          ? format(new Date(desc.review_date), "MM/dd/yyyy")
                          : "-";
                      } catch {
                        return "-";
                      }
                    })()}
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
                          <DropdownMenuItem onClick={() => setEditingId(doc.id)}>
                            <EditIcon className="size-5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteDocument.mutate(doc.id)}
                            className="text-destructive"
                          >
                            <DeleteIcon className="size-5 mr-2" />
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
          Showing {documents.length > 0 ? 1 : 0} to {documents.length} of{" "}
          {documents.length} entries
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

      {/* Add Immigration Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Immigration</DialogTitle>
            <DialogDescription>
              Add a new immigration document for this employee
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((data) => createDocument.mutate(data))}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Document <span className="text-destructive">*</span>
                </Label>
                <Input id="name" {...register("name")} placeholder="e.g., Passport, Visa" />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue_by">
                  Issue By <span className="text-destructive">*</span>
                </Label>
                <Input id="issue_by" {...register("issue_by")} placeholder="e.g., Immigration Office" />
                {errors.issue_by && (
                  <p className="text-sm text-destructive">{errors.issue_by.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issue_date">
                  Issue Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="issue_date"
                  type="date"
                  {...register("issue_date")}
                />
                {errors.issue_date && (
                  <p className="text-sm text-destructive">{errors.issue_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry_date">Expired Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  {...register("expiry_date")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review_date">Review Date</Label>
              <Input
                id="review_date"
                type="date"
                {...register("review_date")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Document File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setValue("file", file);
                }}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={createDocument.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createDocument.isPending}>
                {createDocument.isPending ? "Adding..." : "Add Immigration"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
