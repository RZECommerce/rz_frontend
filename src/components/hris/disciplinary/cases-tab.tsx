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
import { disciplinaryCaseService } from "@/services/disciplinary.service";
import type { DisciplinaryCase } from "@/types/disciplinary";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const severityVariant: Record<string, "outline" | "secondary" | "default" | "destructive"> = {
  minor: "outline",
  moderate: "secondary",
  major: "default",
  critical: "destructive",
};

export function CasesTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["disciplinary-cases"],
    queryFn: () => disciplinaryCaseService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => disciplinaryCaseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinary-cases"] });
      toast.success("Disciplinary case deleted successfully");
    },
    onError: () => toast.error("Failed to delete disciplinary case"),
  });

  const cases: DisciplinaryCase[] = Array.isArray(data) ? data : (data as any)?.data ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><div className="text-muted-foreground">Loading disciplinary cases...</div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Disciplinary Cases</h3>
          <p className="text-sm text-muted-foreground">Manage employee disciplinary cases</p>
        </div>
        <Button className="gap-2"><Add01Icon className="size-5" />Add Case</Button>
      </div>
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Case Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Incident Date</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sanction</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No disciplinary cases found</TableCell></TableRow>
              ) : (
                cases.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.case_code}</TableCell>
                    <TableCell>{c.employee ? `${c.employee.first_name} ${c.employee.last_name}` : "-"}</TableCell>
                    <TableCell>{c.case_type}</TableCell>
                    <TableCell>{c.title}</TableCell>
                    <TableCell>{c.incident_date}</TableCell>
                    <TableCell><Badge variant={severityVariant[c.severity] ?? "outline"}>{c.severity}</Badge></TableCell>
                    <TableCell><Badge variant="secondary">{c.status}</Badge></TableCell>
                    <TableCell>{c.sanction_type || "-"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontalIcon className="size-5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("Delete this disciplinary case?")) deleteMutation.mutate(c.id); }}><Delete01Icon className="size-5 mr-2" />Delete</DropdownMenuItem>
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
