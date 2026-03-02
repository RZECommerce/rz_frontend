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
  Download as DownloadIcon,
  Edit as EditIcon,
  Description as FileTextIcon,
  MoreHoriz as MoreHorizontalIcon
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const documentSchema = z.object({
  name: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Document type is required"),
  expiry_date: z.string().optional().nullable(),
  file: z.instanceof(File).optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface DocumentsSectionProps {
  employeeId: string;
  isEditMode?: boolean;
}

export function DocumentsSection({ employeeId, isEditMode = true }: DocumentsSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [perPage, setPerPage] = React.useState(10);
  const [sortField, setSortField] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

  const { data: documentsData, isLoading } = useQuery({
    queryKey: ["employee-documents", employeeId, { search, per_page: perPage }],
    queryFn: () =>
      employeeDocumentService.getByEmployee(employeeId, {
        search,
        per_page: perPage,
      }),
  });

  const { data: editingDocument } = useQuery({
    queryKey: ["employee-document", editingId],
    queryFn: () => employeeDocumentService.getById(editingId!),
    enabled: !!editingId,
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
    setError,
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: "",
      category: "",
      expiry_date: null,
    },
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const selectedFile = watch("file");

  React.useEffect(() => {
    if (editingDocument && editingId) {
      setValue("name", editingDocument.name);
      setValue("category", editingDocument.category);
      setValue("expiry_date", editingDocument.expiry_date || null);
      setIsAddDialogOpen(true);
    } else if (!editingId) {
      reset();
    }
  }, [editingDocument, editingId, setValue, reset]);

  const createDocument = useMutation({
    mutationFn: async (data: DocumentFormData) => {
      if (!data.file) {
        throw new Error("File is required");
      }
      const formData = new FormData();
      formData.append("employee_id", employeeId);
      formData.append("name", data.name);
      formData.append("category", data.category);
      if (data.expiry_date) {
        formData.append("expiry_date", data.expiry_date);
      }
      formData.append("file", data.file);
      return employeeDocumentService.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-documents", employeeId] });
      toast.success("Document added successfully");
      setIsAddDialogOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error("Failed to add document", {
        description: error.message,
      });
    },
  });

  const updateDocument = useMutation({
    mutationFn: async (data: DocumentFormData) => {
      if (!editingId) throw new Error("No document ID provided");
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("category", data.category);
      if (data.expiry_date) {
        formData.append("expiry_date", data.expiry_date);
      }
      if (data.file) {
        formData.append("file", data.file);
      }
      return employeeDocumentService.update(editingId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-documents", employeeId] });
      toast.success("Document updated successfully");
      setIsAddDialogOpen(false);
      setEditingId(null);
      reset();
    },
    onError: (error: Error) => {
      toast.error("Failed to update document", {
        description: error.message,
      });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: (id: string) => employeeDocumentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-documents", employeeId] });
      toast.success("Document deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete document", {
        description: error.message,
      });
    },
  });

  const downloadDocument = async (id: string, fileName: string) => {
    try {
      const blob = await employeeDocumentService.download(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Document downloaded successfully");
    } catch (error: any) {
      toast.error("Failed to download document", {
        description: error.message,
      });
    }
  };

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

  const getFileExtension = (fileName?: string) => {
    if (!fileName) return "";
    return fileName.split(".").pop()?.toUpperCase() || "";
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingId(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">All Documents</h3>
        {isEditMode && (
          <Button
            onClick={() => {
              setEditingId(null);
              setIsAddDialogOpen(true);
            }}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <AddIcon className="size-5 mr-2" />
            Add Document
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
              <TableHead>Document Type</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center hover:text-foreground"
                >
                  Title
                  <SortIcon field="name" />
                </button>
              </TableHead>
              <TableHead>File</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("expiry_date")}
                  className="flex items-center hover:text-foreground"
                >
                  Expired Date
                  <SortIcon field="expiry_date" />
                </button>
              </TableHead>
              {isEditMode && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isEditMode ? 5 : 4} className="h-24 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isEditMode ? 5 : 4} className="h-24 text-center text-muted-foreground">
                  No data available in table
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc: any) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileTextIcon className="size-5 text-muted-foreground" />
                      <span className="capitalize">{doc.category}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{doc.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {doc.file_name ? (
                      <div className="flex items-center gap-2">
                        <FileTextIcon className="size-5 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm">{doc.file_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(doc.file_size)} • {getFileExtension(doc.file_name)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 ml-auto"
                          onClick={() => downloadDocument(doc.id, doc.file_name)}
                          title="Download"
                        >
                          <DownloadIcon className="size-5" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No file</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {doc.expiry_date
                      ? format(new Date(doc.expiry_date), "MM/dd/yyyy")
                      : "-"}
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

      {/* Add/Edit Document Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Document" : "Add Document"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update document information and upload a new file if needed"
                : "Upload a new document for this employee"}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((data) => {
              if (editingId) {
                updateDocument.mutate(data);
              } else {
                if (!data.file) {
                  setError("file", { message: "File is required" });
                  return;
                }
                createDocument.mutate(data);
              }
            })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="category">
                Document Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("category")}
                onValueChange={(value) => setValue("category", value || "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="id">ID</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="license">License</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input id="name" {...register("name")} placeholder="Document title" />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                id="expiry_date"
                type="date"
                {...register("expiry_date")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">
                Document File {!editingId && <span className="text-destructive">*</span>}
              </Label>
              <div className="space-y-2">
                <Input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setValue("file", file);
                    }
                  }}
                />
                {selectedFile && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <FileTextIcon className="size-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)} • {getFileExtension(selectedFile.name)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        setValue("file", undefined);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      <DeleteIcon className="size-5" />
                    </Button>
                  </div>
                )}
                {editingDocument?.file_name && !selectedFile && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <FileTextIcon className="size-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        Current: {editingDocument.file_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(editingDocument.file_size)} •{" "}
                        {getFileExtension(editingDocument.file_name)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {errors.file && (
                <p className="text-sm text-destructive">{errors.file.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleDialogClose}
                disabled={createDocument.isPending || updateDocument.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createDocument.isPending || updateDocument.isPending}
              >
                {createDocument.isPending || updateDocument.isPending
                  ? editingId
                    ? "Updating..."
                    : "Adding..."
                  : editingId
                    ? "Update Document"
                    : "Add Document"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
