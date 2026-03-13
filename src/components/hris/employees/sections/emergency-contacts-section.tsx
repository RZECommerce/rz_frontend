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
import { employeeEmergencyContactService } from "@/services/employee-profile.service";
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

const emergencyContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relation: z.string().min(1, "Relation is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
});

type EmergencyContactFormData = z.infer<typeof emergencyContactSchema>;

interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  email: string;
  phone: string;
}

interface EmergencyContactsSectionProps {
  employeeId: string;
  isEditMode?: boolean;
}

export function EmergencyContactsSection({
  employeeId,
  isEditMode = true,
}: EmergencyContactsSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [perPage, setPerPage] = React.useState(10);
  const [sortField, setSortField] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

  const { data: contactsData, isLoading } = useQuery({
    queryKey: ["employee-emergency-contacts", employeeId, { search, per_page: perPage }],
    queryFn: () => employeeEmergencyContactService.getAll({ employee_id: employeeId, search, per_page: perPage }),
  });

  const contacts: EmergencyContact[] = React.useMemo(() => {
    if (!contactsData?.data) return [];
    return contactsData.data.map((contact) => ({
      id: contact.id,
      name: contact.name,
      relation: contact.relation,
      email: contact.email,
      phone: contact.phone,
    }));
  }, [contactsData]);

  const deleteContact = useMutation({
    mutationFn: (id: string) => employeeEmergencyContactService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-emergency-contacts", employeeId] });
      toast.success("Emergency contact deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete emergency contact", { description: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmergencyContactFormData>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      name: "",
      relation: "",
      email: "",
      phone: "",
    },
  });

  const filteredContacts = React.useMemo(() => {
    let filtered = contacts;
    if (search) {
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(search.toLowerCase()) ||
          contact.email.toLowerCase().includes(search.toLowerCase()) ||
          contact.phone.includes(search)
      );
    }
    return filtered.slice(0, perPage);
  }, [contacts, search, perPage]);

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

  const onSubmit = (data: EmergencyContactFormData) => {
    toast.info("Create/update functionality coming soon");
    setIsAddDialogOpen(false);
    setEditingId(null);
    reset();
  };

  const handleDelete = (id: string) => {
    deleteContact.mutate(id);
  };

  React.useEffect(() => {
    if (editingId) {
      const contact = contacts.find((c) => c.id === editingId);
      if (contact) {
        reset(contact);
        setIsAddDialogOpen(true);
      }
    }
  }, [editingId, contacts, reset]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Emergency Contacts</h3>
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
            Add Contact
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
                  Name
                  <SortIcon field="name" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("relation")}
                  className="flex items-center hover:text-foreground"
                >
                  Relation
                  <SortIcon field="relation" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("email")}
                  className="flex items-center hover:text-foreground"
                >
                  Email
                  <SortIcon field="email" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("phone")}
                  className="flex items-center hover:text-foreground"
                >
                  Phone
                  <SortIcon field="phone" />
                </button>
              </TableHead>
              {isEditMode && <TableHead className="text-right">action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isEditMode ? 5 : 4} className="h-24 text-center text-muted-foreground">
                  No data available in table
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.relation}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  {isEditMode && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontalIcon className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingId(contact.id)}>
                            <Edit01Icon className="size-5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(contact.id)}
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
          Showing {filteredContacts.length > 0 ? 1 : 0} to {filteredContacts.length} of{" "}
          {contacts.length} entries
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

      {/* Add/Edit Contact Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Emergency Contact" : "Add Emergency Contact"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update emergency contact information"
                : "Add a new emergency contact for this employee"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input id="name" {...register("name")} placeholder="Full name" />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="relation">
                  Relation <span className="text-destructive">*</span>
                </Label>
                <Input id="relation" {...register("relation")} placeholder="e.g., Spouse, Parent" />
                {errors.relation && (
                  <p className="text-sm text-destructive">{errors.relation.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input id="email" type="email" {...register("email")} placeholder="email@example.com" />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input id="phone" {...register("phone")} placeholder="Phone number" />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
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
                {editingId ? "Update" : "Add"} Contact
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
