import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireAuth } from "@/lib/auth/route-guards";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import type { RegisterData } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const Route = createFileRoute("/register")({
  beforeLoad: requireAuth(),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  function onSubmit(data: RegisterFormData) {
    setIsPending(true);
    authService
      .register(data as RegisterData)
      .then((response) => {
        setUser(response.user);
        navigate({ to: "/dashboard" });
      })
      .catch((error) => {
        if (error instanceof Error) {
          setError("root", { message: error.message });
        } else {
          setError("root", {
            message: "Registration failed. Please try again.",
          });
        }
      })
      .finally(() => {
        setIsPending(false);
      });
  }

  return (
    <div
      className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden"
      style={{ scrollbarGutter: "stable" }}
    >
      <div className="flex items-center justify-center py-12 px-4 bg-background relative z-10 h-full overflow-y-auto">
        <div className="mx-auto grid w-full max-w-[400px] gap-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Create an account
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your information below to get started
            </p>
          </div>

          <div className="grid gap-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    {...register("name")}
                    disabled={isPending}
                    className="h-11"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    {...register("email")}
                    disabled={isPending}
                    className="h-11"
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...register("password")}
                    disabled={isPending}
                    className="h-11"
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">
                    Confirm Password
                  </Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...register("password_confirmation")}
                    disabled={isPending}
                    className="h-11"
                  />
                  {errors.password_confirmation && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.password_confirmation.message}
                    </p>
                  )}
                </div>
              </div>

              {errors.root && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive font-medium border border-destructive/20">
                  {errors.root.message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link
                to="/login"
                className="font-bold text-primary hover:text-primary/80 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden bg-muted lg:block relative overflow-hidden">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="absolute inset-0 bg-gradient-to-tl from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="relative z-20 max-w-lg text-center space-y-6">
            <div className="size-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto shadow-2xl flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5 text-white"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" x2="20" y1="8" y2="14" />
                <line x1="23" x2="17" y1="11" y2="11" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Join the Team
            </h2>
            <p className="text-zinc-400 text-lg">
              Create your account to start managing your HR tasks efficiently
              and effectively.
            </p>
          </div>
        </div>

        {/* Abstract background shapes */}
        <div className="absolute top-40 -left-40 size-[500px] bg-indigo-500/30 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 right-0 size-[500px] bg-pink-500/20 rounded-full blur-3xl opacity-50" />
      </div>
    </div>
  );
}
