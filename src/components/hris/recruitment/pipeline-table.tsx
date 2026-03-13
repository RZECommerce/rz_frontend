import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { recruitmentService } from "@/services/recruitment.service";
import type { Candidate, CandidateStatus } from "@/types/recruitment";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreHoriz as MoreHorizontalIcon,
  PersonAdd as RegisterIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import * as React from "react";
import { toast } from "sonner";

const STAGE_CONFIG: Record<CandidateStatus, { label: string; color: string }> = {
  applied: { label: "Applied", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  screening: { label: "Screening", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" },
  interview: { label: "Interview", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" },
  offer: { label: "Offer", color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  hired: { label: "Hired", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
};

interface PipelineTableProps {
  jobPostingId?: string;
  onAddCandidate?: () => void;
  onEditCandidate?: (candidate: Candidate) => void;
  onViewCandidate?: (candidate: Candidate) => void;
  onRegisterCandidate?: (candidate: Candidate) => void;
}

export function PipelineTable({
  jobPostingId,
  onEditCandidate,
  onViewCandidate,
  onRegisterCandidate,
}: PipelineTableProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["candidates", jobPostingId],
    queryFn: () => recruitmentService.getCandidates(jobPostingId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => recruitmentService.deleteCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Candidate deleted");
    },
    onError: () => toast.error("Failed to delete candidate"),
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CandidateStatus }) =>
      recruitmentService.moveCandidate({ candidate_id: id, new_status: status, new_stage: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const filteredCandidates = React.useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch =
        !search ||
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.job_posting?.title?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const notRegistered = !c.employee_id;
      return matchesSearch && matchesStatus && notRegistered;
    });
  }, [candidates, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {Object.entries(STAGE_CONFIG).map(([id, { label }]) => (
              <SelectItem key={id} value={id}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Job Posting</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Loading candidates...
                </TableCell>
              </TableRow>
            ) : filteredCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No candidates found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCandidates.map((candidate) => {
                const stage = STAGE_CONFIG[candidate.status];
                return (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {candidate.first_name} {candidate.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{candidate.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {candidate.job_posting?.title || "—"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={candidate.status}
                        onValueChange={(value) =>
                          moveMutation.mutate({ id: candidate.id, status: value as CandidateStatus })
                        }
                      >
                        <SelectTrigger className="w-[130px] h-7 text-xs border-0 p-0 shadow-none">
                          <Badge className={stage.color} variant="secondary">
                            {stage.label}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STAGE_CONFIG).map(([id, { label }]) => (
                            <SelectItem key={id} value={id}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {candidate.applied_date
                        ? format(new Date(candidate.applied_date), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {candidate.source || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {candidate.rating ? `${candidate.rating}/5` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onViewCandidate && (
                            <DropdownMenuItem onClick={() => onViewCandidate(candidate)}>
                              <ViewIcon className="size-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          )}
                          {onEditCandidate && (
                            <DropdownMenuItem onClick={() => onEditCandidate(candidate)}>
                              <EditIcon className="size-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {candidate.status === "hired" && onRegisterCandidate && (
                            <DropdownMenuItem onClick={() => onRegisterCandidate(candidate)}>
                              <RegisterIcon className="size-4 mr-2" />
                              Register as Employee
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => deleteMutation.mutate(candidate.id)}
                            className="text-destructive"
                          >
                            <DeleteIcon className="size-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
