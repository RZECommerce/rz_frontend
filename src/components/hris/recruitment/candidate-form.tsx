import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { recruitmentService } from "@/services/recruitment.service";
import type { Candidate, CreateCandidateDto } from "@/types/recruitment";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Delete as Delete01Icon,
  Description as File01Icon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const candidateSchema = z.object({
  job_posting_id: z.string().min(1, "Job posting is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  cover_letter: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  resume: z.instanceof(File).optional().nullable(),
  attachments: z.array(z.instanceof(File)).optional(),
});

type CandidateFormData = z.infer<typeof candidateSchema>;

interface CandidateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCandidateDto) => void;
  isSubmitting: boolean;
  candidate?: Candidate | null;
}

export function CandidateForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  candidate,
}: CandidateFormProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const attachmentsInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedResume, setSelectedResume] = React.useState<File | null>(null);
  const [selectedAttachments, setSelectedAttachments] = React.useState<File[]>(
    [],
  );

  const { data: jobPostings = [] } = useQuery({
    queryKey: ["job-postings"],
    queryFn: () => recruitmentService.getJobPostings(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch,
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      job_posting_id: candidate?.job_posting_id || "",
      first_name: candidate?.first_name || "",
      last_name: candidate?.last_name || "",
      email: candidate?.email || "",
      phone: candidate?.phone || null,
      cover_letter: candidate?.cover_letter || null,
      source: candidate?.source || null,
      resume: null,
      attachments: [],
    },
  });

  const selectedJobPostingId = watch("job_posting_id");

  const selectedJobPosting = React.useMemo(
    () => jobPostings.find((job) => job.id === selectedJobPostingId),
    [jobPostings, selectedJobPostingId],
  );

  const resolvedApplicationLink = React.useMemo(() => {
    if (!selectedJobPosting) return undefined;
    if (selectedJobPosting.application_link) {
      const rawLink = selectedJobPosting.application_link;

      if (typeof window !== "undefined") {
        if (rawLink.startsWith("/jobs/")) {
          return `${window.location.origin}${rawLink}`;
        }

        // Replace stale localhost links with the current app origin while preserving the route path.
        try {
          const parsedLink = new URL(rawLink);
          const isLocalHostLink =
            parsedLink.hostname === "localhost" ||
            parsedLink.hostname === "127.0.0.1";

          if (isLocalHostLink) {
            return `${window.location.origin}${parsedLink.pathname}${parsedLink.search}${parsedLink.hash}`;
          }
        } catch {
          // If the stored link is relative or malformed, fallback logic below will handle it.
        }
      }

      return rawLink;
    }

    if (typeof window !== "undefined") {
      return `${window.location.origin}/jobs/${selectedJobPosting.id}`;
    }

    return `/jobs/${selectedJobPosting.id}`;
  }, [selectedJobPosting]);

  React.useEffect(() => {
    if (open) {
      reset({
        job_posting_id: candidate?.job_posting_id || "",
        first_name: candidate?.first_name || "",
        last_name: candidate?.last_name || "",
        email: candidate?.email || "",
        phone: candidate?.phone || null,
        cover_letter: candidate?.cover_letter || null,
        source: candidate?.source || null,
        resume: null,
        attachments: [],
      });
      setSelectedResume(null);
      setSelectedAttachments([]);
    }
  }, [open, candidate, reset]);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedResume(file);
      setValue("resume", file);
    }
  };

  const handleAttachmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newAttachments = [...selectedAttachments, ...files];
      setSelectedAttachments(newAttachments);
      setValue("attachments", newAttachments);
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = selectedAttachments.filter((_, i) => i !== index);
    setSelectedAttachments(newAttachments);
    setValue("attachments", newAttachments);
  };

  const handleCopyApplicationLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // no-op fallback for restricted clipboard environments
    }
  };

  const onFormSubmit = (data: CandidateFormData) => {
    onSubmit({
      ...data,
      resume: selectedResume,
      attachments:
        selectedAttachments.length > 0 ? selectedAttachments : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto font-sans [&_[data-slot=button][data-variant=outline]]:border-primary/20 [&_[data-slot=button][data-variant=outline]]:hover:bg-primary/5 [&_[data-slot=button][data-variant=ghost]]:hover:bg-primary/5">
        <DialogHeader className="border-b border-border/60 pb-4">
          <DialogTitle>
            {candidate ? "Edit Candidate" : "Add Candidate"}
          </DialogTitle>
          <DialogDescription>
            {candidate
              ? "Update candidate information and attachments"
              : "Add a new candidate to the recruitment pipeline"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job_posting_id">
              Job Posting <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="job_posting_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job posting">
                      {selectedJobPosting
                        ? selectedJobPosting.title
                        : "Select a job posting"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {jobPostings.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.job_posting_id && (
              <p className="text-sm text-destructive">
                {errors.job_posting_id.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input id="first_name" {...register("first_name")} />
              {errors.first_name && (
                <p className="text-sm text-destructive">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input id="last_name" {...register("last_name")} />
              {errors.last_name && (
                <p className="text-sm text-destructive">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              placeholder="e.g., LinkedIn, Website, Referral"
              {...register("source")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_letter">Cover Letter</Label>
            <Textarea
              id="cover_letter"
              rows={4}
              {...register("cover_letter")}
              placeholder="Optional cover letter..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume (Optional)</Label>
            <Input
              ref={fileInputRef}
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeChange}
            />
            {selectedResume && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <File01Icon className="size-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedResume.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedResume.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    setSelectedResume(null);
                    setValue("resume", null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  <Delete01Icon className="size-5" />
                </Button>
              </div>
            )}
            {candidate?.resume_file_name && !selectedResume && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <File01Icon className="size-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {candidate.resume_file_name}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments">Additional Attachments</Label>
            <Input
              ref={attachmentsInputRef}
              id="attachments"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleAttachmentsChange}
            />
            {selectedAttachments.length > 0 && (
              <div className="space-y-2">
                {selectedAttachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-muted rounded-md"
                  >
                    <File01Icon className="size-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => removeAttachment(index)}
                    >
                      <Delete01Icon className="size-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {candidate?.attachments &&
              candidate.attachments.length > 0 &&
              selectedAttachments.length === 0 && (
                <div className="space-y-2">
                  {candidate.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-2 p-2 bg-muted rounded-md"
                    >
                      <File01Icon className="size-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {attachment.file_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {selectedJobPosting && resolvedApplicationLink && (
            <div className="space-y-2">
              <Label htmlFor="job_posting_link">
                Job Posting Application Link
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  id="job_posting_link"
                  value={resolvedApplicationLink}
                  readOnly
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleCopyApplicationLink(resolvedApplicationLink)
                    }
                  >
                    Copy
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (resolvedApplicationLink) {
                        window.open(
                          resolvedApplicationLink,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      }
                    }}
                  >
                    Open
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : candidate
                  ? "Update"
                  : "Add Candidate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
