import { CandidateForm } from "@/components/hris/recruitment/candidate-form";
import { JobPostingForm } from "@/components/hris/recruitment/job-posting-form";
import { KanbanBoard } from "@/components/hris/recruitment/kanban-board";
import { PipelineTable } from "@/components/hris/recruitment/pipeline-table";
import { RegisterEmployeeDialog } from "@/components/hris/recruitment/register-employee-dialog";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { requireAuth } from "@/lib/auth/route-guards";
import { cn } from "@/lib/utils";
import { recruitmentService } from "@/services/recruitment.service";
import type { Candidate, CreateCandidateDto, CreateJobPostingDto, JobPosting, UpdateCandidateDto } from "@/types/recruitment";
import {
  Add as Add01Icon,
  Description as File01Icon,
  ViewKanban as KanbanIcon,
  TableChart as TableIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/hris/recruitment")({
  beforeLoad: requireAuth(),
  component: RecruitmentPage,
});

function RecruitmentPage() {
  const queryClient = useQueryClient();
  const [pipelineView, setPipelineView] = React.useState<"kanban" | "table">("kanban");
  const [selectedJobPostingId, setSelectedJobPostingId] = React.useState<string | undefined>();
  const [isCandidateFormOpen, setIsCandidateFormOpen] = React.useState(false);
  const [isJobPostingFormOpen, setIsJobPostingFormOpen] = React.useState(false);
  const [isRegisterEmployeeDialogOpen, setIsRegisterEmployeeDialogOpen] = React.useState(false);
  const [editingCandidate, setEditingCandidate] = React.useState<Candidate | null>(null);
  const [editingJobPosting, setEditingJobPosting] = React.useState<JobPosting | null>(null);
  const [registeringCandidate, setRegisteringCandidate] = React.useState<Candidate | null>(null);

  const { data: jobPostings = [] } = useQuery({
    queryKey: ["job-postings"],
    queryFn: () => recruitmentService.getJobPostings(),
  });

  const selectedJobPostingTitle = React.useMemo(() => {
    if (!selectedJobPostingId) return undefined;
    const selected = jobPostings.find((job) => job.id === selectedJobPostingId);
    return selected?.title;
  }, [jobPostings, selectedJobPostingId]);

  const createCandidateMutation = useMutation({
    mutationFn: (data: CreateCandidateDto) => recruitmentService.createCandidate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      setIsCandidateFormOpen(false);
      setEditingCandidate(null);
      toast.success("Candidate added successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to add candidate", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const updateCandidateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCandidateDto }) =>
      recruitmentService.updateCandidate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      setIsCandidateFormOpen(false);
      setEditingCandidate(null);
      toast.success("Candidate updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update candidate", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const createJobPostingMutation = useMutation({
    mutationFn: (data: CreateJobPostingDto) => recruitmentService.createJobPosting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-postings"] });
      setIsJobPostingFormOpen(false);
      setEditingJobPosting(null);
      toast.success("Job posting created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create job posting", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const updateJobPostingMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateJobPostingDto> }) =>
      recruitmentService.updateJobPosting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-postings"] });
      setIsJobPostingFormOpen(false);
      setEditingJobPosting(null);
      toast.success("Job posting updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update job posting", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const handleAddCandidate = () => {
    setEditingCandidate(null);
    setIsCandidateFormOpen(true);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setIsCandidateFormOpen(true);
  };

  const handleViewCandidate = (candidate: Candidate) => {
    // For now, just open edit form. Can be enhanced with a view-only modal
    handleEditCandidate(candidate);
  };

  const handleCandidateSubmit = (data: CreateCandidateDto) => {
    if (editingCandidate) {
      // For updates, we need to create a new candidate with updated info
      // The backend should handle this as an update when the ID exists
      createCandidateMutation.mutate(data);
    } else {
      createCandidateMutation.mutate(data);
    }
  };

  const handleAddJobPosting = () => {
    setEditingJobPosting(null);
    setIsJobPostingFormOpen(true);
  };

  const handleEditJobPosting = (jobPosting: JobPosting) => {
    setEditingJobPosting(jobPosting);
    setIsJobPostingFormOpen(true);
  };

  const handleJobPostingSubmit = (data: CreateJobPostingDto) => {
    if (editingJobPosting) {
      updateJobPostingMutation.mutate({ id: editingJobPosting.id, data });
    } else {
      createJobPostingMutation.mutate(data);
    }
  };

  const convertToEmployeeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      recruitmentService.convertToEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      setIsRegisterEmployeeDialogOpen(false);
      setRegisteringCandidate(null);
      toast.success("Candidate successfully registered as employee");
    },
    onError: (error: any) => {
      toast.error("Failed to register employee", {
        description: error?.response?.data?.message || error.message || "An unknown error occurred",
      });
    },
  });

  const handleRegisterCandidate = (candidate: Candidate) => {
    setRegisteringCandidate(candidate);
    setIsRegisterEmployeeDialogOpen(true);
  };

  const handleRegisterEmployeeSubmit = (data: {
    position_id: string;
    department_id: string;
    employment_type_id: string;
    hire_date: string;
    salary?: number;
  }) => {
    if (registeringCandidate) {
      convertToEmployeeMutation.mutate({
        id: registeringCandidate.id,
        data,
      });
    }
  };

  return (
    <DashboardLayout>
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Recruitment</h1>
            <p className="text-muted-foreground">
              Manage job postings and candidates with Kanban board
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleAddJobPosting} variant="outline" className="gap-2">
              <File01Icon className="size-5" />
              Job Posting
            </Button>
            <Button onClick={handleAddCandidate} className="gap-2">
              <Add01Icon className="size-5" />
              Add Candidate
            </Button>
          </div>
        </div>

        <div className="w-full space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="job-filter" className="text-sm font-medium">
                  Filter by Job:
                </label>
                <Select
                  value={selectedJobPostingId || "all"}
                  onValueChange={(value) => setSelectedJobPostingId(value === "all" ? undefined : (value || undefined))}
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="All Job Postings">
                      {selectedJobPostingTitle}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Job Postings</SelectItem>
                    {jobPostings.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <Button
                  variant={pipelineView === "kanban" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none gap-1.5"
                  onClick={() => setPipelineView("kanban")}
                >
                  <KanbanIcon className="size-4" />
                  Board
                </Button>
                <Button
                  variant={pipelineView === "table" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none gap-1.5"
                  onClick={() => setPipelineView("table")}
                >
                  <TableIcon className="size-4" />
                  Table
                </Button>
              </div>
            </div>

            {pipelineView === "kanban" ? (
              <div className="border rounded-lg p-4 bg-background">
                <KanbanBoard
                  jobPostingId={selectedJobPostingId}
                  onAddCandidate={handleAddCandidate}
                  onEditCandidate={handleEditCandidate}
                  onViewCandidate={handleViewCandidate}
                  onRegisterCandidate={handleRegisterCandidate}
                />
              </div>
            ) : (
              <PipelineTable
                jobPostingId={selectedJobPostingId}
                onAddCandidate={handleAddCandidate}
                onEditCandidate={handleEditCandidate}
                onViewCandidate={handleViewCandidate}
                onRegisterCandidate={handleRegisterCandidate}
              />
            )}
        </div>

        <CandidateForm
          open={isCandidateFormOpen}
          onOpenChange={setIsCandidateFormOpen}
          onSubmit={handleCandidateSubmit}
          isSubmitting={
            createCandidateMutation.isPending || updateCandidateMutation.isPending
          }
          candidate={editingCandidate}
        />

        <JobPostingForm
          open={isJobPostingFormOpen}
          onOpenChange={setIsJobPostingFormOpen}
          onSubmit={handleJobPostingSubmit}
          isSubmitting={
            createJobPostingMutation.isPending || updateJobPostingMutation.isPending
          }
          jobPosting={editingJobPosting}
        />

        <RegisterEmployeeDialog
          open={isRegisterEmployeeDialogOpen}
          onOpenChange={setIsRegisterEmployeeDialogOpen}
          candidate={registeringCandidate}
          onSubmit={handleRegisterEmployeeSubmit}
          isSubmitting={convertToEmployeeMutation.isPending}
        />
      </main>
    </DashboardLayout>
  );
}
