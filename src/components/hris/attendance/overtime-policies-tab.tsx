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
import { overtimePolicyService } from "@/services/attendance-extensions.service";
import type { OvertimePolicy } from "@/types/attendance-extensions";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function OvertimePoliciesTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["overtime-policies"],
    queryFn: () => overtimePolicyService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => overtimePolicyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overtime-policies"] });
      toast.success("Overtime policy deleted successfully");
    },
    onError: () => toast.error("Failed to delete overtime policy"),
  });

  const policies: OvertimePolicy[] = Array.isArray(data) ? data : (data as any)?.data ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><div className="text-muted-foreground">Loading overtime policies...</div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Overtime Policies</h3>
          <p className="text-sm text-muted-foreground">Manage overtime rate policies</p>
        </div>
        <Button className="gap-2"><Add01Icon className="size-5" />Add Policy</Button>
      </div>
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Regular OT Rate</TableHead>
                <TableHead>Rest Day Rate</TableHead>
                <TableHead>Holiday Regular Rate</TableHead>
                <TableHead>Night Diff Rate</TableHead>
                <TableHead>Max OT/Day</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No overtime policies found</TableCell></TableRow>
              ) : (
                policies.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.policy_code}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.regular_ot_rate}x</TableCell>
                    <TableCell>{p.rest_day_ot_rate}x</TableCell>
                    <TableCell>{p.holiday_regular_ot_rate}x</TableCell>
                    <TableCell>{p.night_diff_rate}x</TableCell>
                    <TableCell>{p.max_ot_hours_per_day ? `${p.max_ot_hours_per_day} hrs` : "-"}</TableCell>
                    <TableCell><Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontalIcon className="size-5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("Delete this overtime policy?")) deleteMutation.mutate(p.id); }}><Delete01Icon className="size-5 mr-2" />Delete</DropdownMenuItem>
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
