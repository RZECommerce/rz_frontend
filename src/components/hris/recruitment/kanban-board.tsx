import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { recruitmentService } from "@/services/recruitment.service";
import type { Candidate, CandidateStatus } from "@/types/recruitment";
import {
  Add as Add01Icon,
  Description as File01Icon,
  MoreHoriz as MoreHorizontalIcon,
  Person as UserIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import * as React from "react";
import { toast } from "sonner";

const STAGES: Array<{ id: CandidateStatus; label: string; color: string }> = [
  { id: "applied", label: "Applied", color: "bg-blue-100 text-blue-800" },
  {
    id: "screening",
    label: "Screening",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "interview",
    label: "Interview",
    color: "bg-purple-100 text-purple-800",
  },
  { id: "offer", label: "Offer", color: "bg-green-100 text-green-800" },
  { id: "hired", label: "Hired", color: "bg-emerald-100 text-emerald-800" },
  { id: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
];

interface KanbanBoardProps {
  jobPostingId?: string;
  onAddCandidate?: () => void;
  onEditCandidate?: (candidate: Candidate) => void;
  onViewCandidate?: (candidate: Candidate) => void;
  onRegisterCandidate?: (candidate: Candidate) => void;
}

export function KanbanBoard({
  jobPostingId,
  onAddCandidate,
  onEditCandidate,
  onViewCandidate,
  onRegisterCandidate,
}: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const [draggedCandidate, setDraggedCandidate] =
    React.useState<Candidate | null>(null);
  const [draggedOverStage, setDraggedOverStage] =
    React.useState<CandidateStatus | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["candidates", jobPostingId],
    queryFn: () => recruitmentService.getCandidates(jobPostingId),
  });

  // Handle horizontal scroll with mouse wheel
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Only enable horizontal scroll when Alt is pressed
      if (e.altKey && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        if (maxScrollLeft > 0) {
          e.preventDefault();
          container.scrollLeft += e.deltaY;
        }
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const moveCandidateMutation = useMutation({
    mutationFn: (data: {
      candidate_id: string;
      new_status: CandidateStatus;
      new_stage: string;
    }) => recruitmentService.moveCandidate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Candidate moved successfully");
    },
    onError: () => {
      toast.error("Failed to move candidate");
    },
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: (id: string) => recruitmentService.deleteCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Candidate deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete candidate");
    },
  });

  const handleDragStart = (e: React.DragEvent, candidate: Candidate) => {
    setDraggedCandidate(candidate);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
  };

  const handleDragOver = (e: React.DragEvent, stage: CandidateStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDraggedOverStage(stage);
  };

  const handleDragLeave = () => {
    setDraggedOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: CandidateStatus) => {
    e.preventDefault();
    setDraggedOverStage(null);

    if (!draggedCandidate || draggedCandidate.status === targetStage) {
      setDraggedCandidate(null);
      return;
    }

    moveCandidateMutation.mutate({
      candidate_id: draggedCandidate.id,
      new_status: targetStage,
      new_stage: targetStage,
    });

    setDraggedCandidate(null);
  };

  const handleDelete = (candidate: Candidate) => {
    if (
      confirm(
        `Are you sure you want to delete ${candidate.first_name} ${candidate.last_name}?`,
      )
    ) {
      deleteCandidateMutation.mutate(candidate.id);
    }
  };

  const getCandidatesByStage = (stage: CandidateStatus): Candidate[] => {
    return candidates.filter((c) => c.status === stage && !c.employee_id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading candidates...</div>
      </div>
    );
  }

  return (
    <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageCandidates = getCandidatesByStage(stage.id);
        const isDraggedOver = draggedOverStage === stage.id;

        return (
          <div
            key={stage.id}
            className={cn(
              "flex-shrink-0 w-80",
              isDraggedOver && "ring-2 ring-primary ring-offset-2",
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={stage.color}>{stage.label}</Badge>
                <span className="text-sm text-muted-foreground">
                  ({stageCandidates.length})
                </span>
              </div>
              {onAddCandidate && stage.id === "applied" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onAddCandidate}
                  className="h-7 w-7 p-0"
                >
                  <Add01Icon className="size-5" />
                </Button>
              )}
            </div>
            <div
              className={cn(
                "min-h-[400px] rounded-lg border-2 border-dashed p-2 transition-colors",
                isDraggedOver
                  ? "border-primary bg-primary/5"
                  : "border-muted bg-muted/30",
              )}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="space-y-2">
                {stageCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onDragStart={handleDragStart}
                    onEdit={onEditCandidate}
                    onView={onViewCandidate}
                    onDelete={handleDelete}
                    onRegister={
                      stage.id === "hired" ? onRegisterCandidate : undefined
                    }
                  />
                ))}
                {stageCandidates.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface CandidateCardProps {
  candidate: Candidate;
  onDragStart: (e: React.DragEvent, candidate: Candidate) => void;
  onEdit?: (candidate: Candidate) => void;
  onView?: (candidate: Candidate) => void;
  onDelete?: (candidate: Candidate) => void;
  onRegister?: (candidate: Candidate) => void;
}

function CandidateCard({
  candidate,
  onDragStart,
  onEdit,
  onView,
  onDelete,
  onRegister,
}: CandidateCardProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e, candidate);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const attachmentCount = candidate.attachments?.length || 0;

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "cursor-move transition-all hover:shadow-md",
        isDragging && "opacity-50",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">
              {candidate.first_name} {candidate.last_name}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {candidate.email}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontalIcon className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(candidate)}>
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(candidate)}>
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(candidate)}
                  className="text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {candidate.job_posting && (
          <div className="mb-2">
            <p className="text-xs font-medium text-muted-foreground truncate">
              {candidate.job_posting.title}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          {candidate.phone && (
            <div className="flex items-center gap-1">
              <UserIcon className="size-5" />
              <span>{candidate.phone}</span>
            </div>
          )}
          {attachmentCount > 0 && (
            <div className="flex items-center gap-1">
              <File01Icon className="size-5" />
              <span>{attachmentCount}</span>
            </div>
          )}
        </div>

        {candidate.rating && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs font-medium">⭐ {candidate.rating}/5</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Applied: {format(new Date(candidate.applied_date), "MMM d, yyyy")}
        </div>

        {onRegister &&
          candidate.status === "hired" &&
          !candidate.employee_id && (
            <div className="mt-3 pt-3 border-t">
              <Button
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegister(candidate);
                }}
              >
                Register as Employee
              </Button>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
