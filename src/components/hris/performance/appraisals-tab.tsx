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
import { performanceAppraisalService } from "@/services/performance.service";
import type { PerformanceAppraisal } from "@/types/performance";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function AppraisalsTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["performance-appraisals"],
    queryFn: () => performanceAppraisalService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => performanceAppraisalService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-appraisals"] });
      toast.success("Appraisal deleted successfully");
    },
    onError: () => toast.error("Failed to delete appraisal"),
  });

  const appraisals: PerformanceAppraisal[] = Array.isArray(data) ? data : (data as any)?.data ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><div className="text-muted-foreground">Loading appraisals...</div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Performance Appraisals</h3>
          <p className="text-sm text-muted-foreground">Manage employee performance appraisals</p>
        </div>
        <Button className="gap-2"><Add01Icon className="size-5" />Add Appraisal</Button>
      </div>
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Overall Rating</TableHead>
                <TableHead>Calibrated Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appraisals.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No performance appraisals found</TableCell></TableRow>
              ) : (
                appraisals.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.appraisal_code}</TableCell>
                    <TableCell>{a.employee ? `${a.employee.first_name} ${a.employee.last_name}` : "-"}</TableCell>
                    <TableCell>{a.period_start} to {a.period_end}</TableCell>
                    <TableCell><Badge variant="secondary">{a.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell>{a.overall_rating ?? "-"}</TableCell>
                    <TableCell>{a.calibrated_rating ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontalIcon className="size-5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("Delete this appraisal?")) deleteMutation.mutate(a.id); }}><Delete01Icon className="size-5 mr-2" />Delete</DropdownMenuItem>
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
