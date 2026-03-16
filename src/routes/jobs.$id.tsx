import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { recruitmentService } from "@/services/recruitment.service";
import type { PublicJobApplicationDto } from "@/types/recruitment";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Helmet } from "react-helmet-async";

export const Route = createFileRoute("/jobs/$id")({
  component: PublicJobApplicationPage,
});

interface ApplicationFormState {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  cover_letter: string;
}

function PublicJobApplicationPage() {
  const { id } = Route.useParams();
  const [resume, setResume] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [formState, setFormState] = useState<ApplicationFormState>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    cover_letter: "",
  });
  const [formError, setFormError] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    data: jobPosting,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["public-job-posting", id],
    queryFn: () => recruitmentService.getPublicJobPosting(id),
    retry: false,
  });

  const submitApplicationMutation = useMutation({
    mutationFn: (payload: PublicJobApplicationDto) =>
      recruitmentService.applyToJobPosting(id, payload),
    onSuccess: () => {
      setIsSubmitted(true);
      setFormError("");
    },
    onError: (submitError: Error) => {
      setFormError(
        submitError.message ||
          "Failed to submit your application. Please try again.",
      );
    },
  });

  const handleInputChange = (
    field: keyof ApplicationFormState,
    value: string,
  ): void => {
    // Keep form state updates centralized to avoid repetitive setState calls.
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!formState.first_name || !formState.last_name || !formState.email) {
      setFormError("First name, last name, and email are required.");
      return;
    }

    setFormError("");

    submitApplicationMutation.mutate({
      first_name: formState.first_name,
      last_name: formState.last_name,
      email: formState.email,
      phone: formState.phone || null,
      cover_letter: formState.cover_letter || null,
      source: "Public Application Link",
      resume,
      attachments,
    });
  };

  if (isLoading) {
    return (
      <main
        className="min-h-screen overflow-auto bg-slate-50 px-4 py-10"
        style={{ scrollbarGutter: "stable" }}
      >
        <section className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Loading Job Posting</CardTitle>
              <CardDescription>
                Please wait while we load the application form.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>
    );
  }

  if (isError || !jobPosting) {
    return (
      <main
        className="min-h-screen overflow-auto bg-slate-50 px-4 py-10"
        style={{ scrollbarGutter: "stable" }}
      >
        <section className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Job Posting Not Found</CardTitle>
              <CardDescription>
                {(error as Error | null)?.message ||
                  "This application link is invalid or no longer available."}
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen overflow-auto bg-gradient-to-b from-slate-50 via-emerald-50/40 to-cyan-50/40 px-4 py-10"
      style={{ scrollbarGutter: "stable" }}
    >
      <Helmet>
        <title>{`Apply - ${jobPosting.title}`}</title>
      </Helmet>

      <section className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Career Opportunity
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {jobPosting.title}
          </h1>
          {jobPosting.location ? (
            <p className="text-sm text-slate-600">
              Location: {jobPosting.location}
            </p>
          ) : null}
        </header>

        <Card className="border-emerald-100 shadow-sm">
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
            <CardDescription>
              Complete the fields below and submit your application for review.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isSubmitted ? (
              <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <h2 className="text-lg font-semibold text-emerald-900">
                  Application Submitted
                </h2>
                <p className="mt-1 text-sm text-emerald-800">
                  Thank you for applying. Our recruitment team will review your
                  submission.
                </p>
              </section>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={formState.first_name}
                      onChange={(event) =>
                        handleInputChange("first_name", event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formState.last_name}
                      onChange={(event) =>
                        handleInputChange("last_name", event.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formState.email}
                      onChange={(event) =>
                        handleInputChange("email", event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formState.phone}
                      onChange={(event) =>
                        handleInputChange("phone", event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover_letter">Cover Letter</Label>
                  <Textarea
                    id="cover_letter"
                    value={formState.cover_letter}
                    onChange={(event) =>
                      handleInputChange("cover_letter", event.target.value)
                    }
                    rows={5}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume (PDF, DOC, DOCX)</Label>
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(event) => {
                        const selectedFile = event.target.files?.[0] ?? null;
                        setResume(selectedFile);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attachments">Additional Attachments</Label>
                    <Input
                      id="attachments"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(event) => {
                        // Persist selected files to allow multi-attachment upload.
                        setAttachments(Array.from(event.target.files ?? []));
                      }}
                    />
                  </div>
                </div>

                {formError ? (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {formError}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={submitApplicationMutation.isPending}
                >
                  {submitApplicationMutation.isPending
                    ? "Submitting..."
                    : "Submit Application"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
