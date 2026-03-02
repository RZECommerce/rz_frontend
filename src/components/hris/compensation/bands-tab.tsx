import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { compensationBandService } from "@/services/compensation.service";
import type { CompensationBand } from "@/types/compensation";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function BandsTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["compensation-bands"],
    queryFn: () => compensationBandService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => compensationBandService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compensation-bands"] });
      toast.success("Compensation band deleted successfully");
    },
    onError: () => toast.error("Failed to delete compensation band"),
  });

  const bands: CompensationBand[] = Array.isArray(data) ? data : (data as any)?.data ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><div className="text-muted-foreground">Loading compensation bands...</div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Compensation Bands</h3>
          <p className="text-sm text-muted-foreground">Manage salary bands by position</p>
        </div>
        <Button className="gap-2"><Add01Icon className="size-5" />Add Band</Button>
      </div>
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Band Name</TableHead>
                <TableHead>Min Salary</TableHead>
                <TableHead>Mid Salary</TableHead>
                <TableHead>Max Salary</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bands.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No compensation bands found</TableCell></TableRow>
              ) : (
                bands.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.position?.name || "-"}</TableCell>
                    <TableCell>{b.band_name}</TableCell>
                    <TableCell>{b.min_salary.toLocaleString()}</TableCell>
                    <TableCell>{b.mid_salary.toLocaleString()}</TableCell>
                    <TableCell>{b.max_salary.toLocaleString()}</TableCell>
                    <TableCell>{b.currency}</TableCell>
                    <TableCell>{b.effective_date}</TableCell>
                    <TableCell><Badge variant={b.is_active ? "default" : "secondary"}>{b.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontalIcon className="size-5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("Delete this compensation band?")) deleteMutation.mutate(b.id); }}><Delete01Icon className="size-5 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
