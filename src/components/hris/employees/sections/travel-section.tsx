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
import { travelService } from "@/services/core-hr.service";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreHoriz as MoreHorizontalIcon
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const travelSchema = z.object({
  purpose: z.string().min(1, "Purpose is required"),
  destination: z.string().min(1, "Destination is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  expenses: z.number().min(0).optional().nullable(),
  description: z.string().optional().nullable(),
});

type TravelFormData = z.infer<typeof travelSchema>;

interface Travel {
  id: string;
  purpose: string;
  destination: string;
  start_date: string;
  end_date: string;
  expenses: number | null;
  description: string | null;
}

interface TravelSectionProps {
  employeeId: string;
  isEditMode?: boolean;
}

export function TravelSection({ employeeId, isEditMode = true }: TravelSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [perPage, setPerPage] = React.useState(10);

  const { data: travelsData, isLoading } = useQuery({
    queryKey: ["travels", employeeId, { search, per_page: perPage }],
    queryFn: () => travelService.getAll({ employee_id: employeeId, search, per_page: perPage }),
  });

  const travels: Travel[] = React.useMemo(() => {
    if (!travelsData?.data) return [];
    return travelsData.data.map((t) => ({
      id: t.id,
      purpose: t.purpose_of_visit || "Business Trip",
      destination: t.place_of_visit || "Unknown",
      start_date: t.start_date,
      end_date: t.end_date,
      expenses: t.actual_budget || t.expected_budget || null,
      description: t.description || null,
    }));
  }, [travelsData]);

  const deleteTravel = useMutation({
    mutationFn: (id: string) => travelService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travels", employeeId] });
      toast.success("Travel deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete travel", { description: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TravelFormData>({
    resolver: zodResolver(travelSchema),
    defaultValues: {
      purpose: "",
      destination: "",
      start_date: "",
      end_date: "",
      expenses: null,
      description: "",
    },
  });

  const filteredTravels = React.useMemo(() => {
    let filtered = travels;
    if (search) {
      filtered = filtered.filter(
        (travel) =>
          travel.purpose.toLowerCase().includes(search.toLowerCase()) ||
          travel.destination.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered.slice(0, perPage);
  }, [travels, search, perPage]);

  React.useEffect(() => {
    if (editingId) {
      const travel = travels.find((t) => t.id === editingId);
      if (travel) {
        reset({
          purpose: travel.purpose,
          destination: travel.destination,
          start_date: travel.start_date,
          end_date: travel.end_date,
          expenses: travel.expenses,
          description: travel.description || "",
        });
        setIsAddDialogOpen(true);
      }
    }
  }, [editingId, travels, reset]);

  const onSubmit = (data: TravelFormData) => {
    toast.info("Create/update functionality coming soon");
    setIsAddDialogOpen(false);
    setEditingId(null);
    reset();
  };

  const handleDelete = (id: string) => {
    deleteTravel.mutate(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Travel Records</h3>
        {isEditMode && (
          <Button
            onClick={() => {
              reset();
              setEditingId(null);
              setIsAddDialogOpen(true);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <AddIcon className="size-5 mr-2" />
            Add Travel
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
            placeholder="Search travel records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Purpose</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Expenses</TableHead>
              {isEditMode && <TableHead className="text-right">action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTravels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isEditMode ? 6 : 5} className="h-24 text-center text-muted-foreground">
                  No data available in table
                </TableCell>
              </TableRow>
            ) : (
              filteredTravels.map((travel) => (
                <TableRow key={travel.id}>
                  <TableCell className="font-medium">{travel.purpose}</TableCell>
                  <TableCell>{travel.destination}</TableCell>
                  <TableCell>{new Date(travel.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(travel.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {travel.expenses ? `₱${travel.expenses.toLocaleString()}` : "-"}
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
                          <DropdownMenuItem onClick={() => setEditingId(travel.id)}>
                            <EditIcon className="size-5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(travel.id)}
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Travel Record" : "Add Travel Record"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update travel information" : "Add a new travel record"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">
                Purpose <span className="text-destructive">*</span>
              </Label>
              <Input id="purpose" {...register("purpose")} placeholder="Enter purpose" />
              {errors.purpose && (
                <p className="text-sm text-destructive">{errors.purpose.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">
                Destination <span className="text-destructive">*</span>
              </Label>
              <Input id="destination" {...register("destination")} placeholder="Enter destination" />
              {errors.destination && (
                <p className="text-sm text-destructive">{errors.destination.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input id="start_date" type="date" {...register("start_date")} />
                {errors.start_date && (
                  <p className="text-sm text-destructive">{errors.start_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">
                  End Date <span className="text-destructive">*</span>
                </Label>
                <Input id="end_date" type="date" {...register("end_date")} />
                {errors.end_date && (
                  <p className="text-sm text-destructive">{errors.end_date.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenses">Expenses</Label>
              <Input
                id="expenses"
                type="number"
                step="0.01"
                {...register("expenses", { valueAsNumber: true })}
                placeholder="Enter expenses"
              />
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
              <Button type="submit">{editingId ? "Update" : "Add"} Travel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
