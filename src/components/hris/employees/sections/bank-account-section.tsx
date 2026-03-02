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
import { employeeBankAccountService } from "@/services/employee-profile.service";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as Add01Icon,
  ArrowDownward as ArrowDown01Icon,
  ArrowUpward as ArrowUp01Icon,
  Delete as Delete01Icon,
  Edit as Edit01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const bankAccountSchema = z.object({
  account_title: z.string().min(1, "Account title is required"),
  account_number: z.string().min(1, "Account number is required"),
  bank_name: z.string().min(1, "Bank name is required"),
  bank_code: z.string().optional().nullable(),
  bank_branch: z.string().optional().nullable(),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

interface BankAccount {
  id: string;
  account_title: string;
  account_number: string;
  bank_name: string;
  bank_code: string | null;
  bank_branch: string | null;
}

interface BankAccountSectionProps {
  employeeId: string;
  isEditMode?: boolean;
}

export function BankAccountSection({ employeeId, isEditMode = true }: BankAccountSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [perPage, setPerPage] = React.useState(10);
  const [sortField, setSortField] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

  const { data: bankAccountData, isLoading } = useQuery({
    queryKey: ["employee-bank-accounts", employeeId, { search, per_page: perPage }],
    queryFn: () => employeeBankAccountService.getAll({ employee_id: employeeId, search, per_page: perPage }),
  });

  const bankAccounts: BankAccount[] = React.useMemo(() => {
    if (!bankAccountData?.data) return [];
    return bankAccountData.data.map((account) => ({
      id: account.id,
      account_title: account.account_title,
      account_number: account.account_number,
      bank_name: account.bank_name,
      bank_code: account.bank_code ?? null,
      bank_branch: account.bank_branch ?? null,
    }));
  }, [bankAccountData]);

  const deleteBankAccount = useMutation({
    mutationFn: (id: string) => employeeBankAccountService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-bank-accounts", employeeId] });
      toast.success("Bank account deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete bank account", { description: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      account_title: "",
      account_number: "",
      bank_name: "",
      bank_code: null,
      bank_branch: null,
    },
  });

  const filteredBankAccounts = React.useMemo(() => {
    let filtered = bankAccounts;
    if (search) {
      filtered = filtered.filter(
        (account) =>
          account.account_title.toLowerCase().includes(search.toLowerCase()) ||
          account.account_number.includes(search) ||
          account.bank_name.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered.slice(0, perPage);
  }, [bankAccounts, search, perPage]);

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
      <Tag
        className="size-5 ml-1"
      />
    );
  };

  const Tag = sortDirection === "asc" ? ArrowUp01Icon : ArrowDown01Icon;

  const onSubmit = (data: BankAccountFormData) => {
    toast.info("Create/update functionality coming soon");
    setIsAddDialogOpen(false);
    setEditingId(null);
    reset();
  };

  const handleDelete = (id: string) => {
    deleteBankAccount.mutate(id);
  };

  React.useEffect(() => {
    if (editingId) {
      const account = bankAccounts.find((a) => a.id === editingId);
      if (account) {
        reset(account);
        setIsAddDialogOpen(true);
      }
    }
  }, [editingId, bankAccounts, reset]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Bank Account</h3>
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
            Add Bank Account
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
                  onClick={() => handleSort("account_title")}
                  className="flex items-center hover:text-foreground"
                >
                  Account Title
                  <SortIcon field="account_title" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("account_number")}
                  className="flex items-center hover:text-foreground"
                >
                  Account Number
                  <SortIcon field="account_number" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("bank_name")}
                  className="flex items-center hover:text-foreground"
                >
                  Bank Name
                  <SortIcon field="bank_name" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("bank_code")}
                  className="flex items-center hover:text-foreground"
                >
                  Bank Code
                  <SortIcon field="bank_code" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("bank_branch")}
                  className="flex items-center hover:text-foreground"
                >
                  Bank Branch
                  <SortIcon field="bank_branch" />
                </button>
              </TableHead>
              {isEditMode && <TableHead className="text-right">action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBankAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isEditMode ? 6 : 5} className="h-24 text-center text-muted-foreground">
                  No data available in table
                </TableCell>
              </TableRow>
            ) : (
              filteredBankAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.account_title}</TableCell>
                  <TableCell>{account.account_number}</TableCell>
                  <TableCell>{account.bank_name}</TableCell>
                  <TableCell>{account.bank_code || "-"}</TableCell>
                  <TableCell>{account.bank_branch || "-"}</TableCell>
                  {isEditMode && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontalIcon className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingId(account.id)}>
                            <Edit01Icon className="size-5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(account.id)}
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
          Showing {filteredBankAccounts.length > 0 ? 1 : 0} to {filteredBankAccounts.length} of{" "}
          {bankAccounts.length} entries
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

      {/* Add/Edit Bank Account Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Bank Account" : "Add Bank Account"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update bank account information"
                : "Add a new bank account for this employee"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_title">
                  Account Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="account_title"
                  {...register("account_title")}
                  placeholder="Account holder name"
                />
                {errors.account_title && (
                  <p className="text-sm text-destructive">{errors.account_title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_number">
                  Account Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="account_number"
                  {...register("account_number")}
                  placeholder="Account number"
                />
                {errors.account_number && (
                  <p className="text-sm text-destructive">{errors.account_number.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_name">
                Bank Name <span className="text-destructive">*</span>
              </Label>
              <Input id="bank_name" {...register("bank_name")} placeholder="Bank name" />
              {errors.bank_name && (
                <p className="text-sm text-destructive">{errors.bank_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_code">Bank Code</Label>
                <Input id="bank_code" {...register("bank_code")} placeholder="Bank code" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_branch">Bank Branch</Label>
                <Input id="bank_branch" {...register("bank_branch")} placeholder="Branch name" />
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
                {editingId ? "Update" : "Add"} Bank Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
