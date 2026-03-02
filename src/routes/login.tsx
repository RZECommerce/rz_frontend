import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirectIfAuthenticated } from "@/lib/auth-guard";
import { useAuthStore } from "@/stores/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    await redirectIfAuthenticated();
  },
  component: LoginPage,
});

function LoginPage() {
  const [isPending, setIsPending] = useState(false);
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit", // Only validate on submit, not on blur/change
    defaultValues: {
      remember: false,
    },
  });

  async function onSubmit(data: LoginFormData) {
    setIsPending(true);
    try {
      await login(data.email, data.password, data.remember);
      // Login successful - verify auth state is set
      const authState = useAuthStore.getState();
      if (authState.isAuthenticated && authState.user) {
        // Use window.location for reliable redirect after login
        // This ensures the page fully reloads, all guards re-run with fresh auth state,
        // and session cookies are properly established
        window.location.href = "/dashboard";
        return; // Exit early since we're redirecting
      } else {
        // State should be set by login, but if not, try fetching
        await useAuthStore.getState().fetchUser();
        const updatedState = useAuthStore.getState();
        if (updatedState.isAuthenticated && updatedState.user) {
          window.location.href = "/dashboard";
          return; // Exit early since we're redirecting
        } else {
          setError("root", {
            message:
              "Login successful but unable to verify authentication. Please refresh the page.",
          });
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setError("root", { message: error.message });
      } else {
        setError("root", { message: "Login failed. Please try again." });
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden">
      {/* Left Panel - Branding */}
      <div 
        className="hidden lg:flex flex-col justify-between bg-slate-900 p-12 relative overflow-hidden"
        style={{
          backgroundImage: 'url(/images/bg-login.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-slate-900/70" />
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Top Section */}
          <div>
            {/* Small tagline */}
            <p className="text-gray-400 text-sm mb-2 rounded-full border border-gray-400 px-2 py-1 w-fit">All in one platform.</p>
            
            {/* Main tagline */}
            <h2 className="text-white text-2xl font-normal">
              Track. Convert. Deliver.
            </h2>
          </div>

          {/* Middle Section - Empty for spacing */}
          <div className="flex-1" />

          {/* Bottom Section - Logo, Title, Description and Contact Button */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="mb-6">
              <svg width="75" height="36" viewBox="0 0 75 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32.239 35.8926H55.7134C49.7108 34.7816 50.4254 30.1598 51.533 27.9877L74.3643 6.10352e-05H35.4546L42.3147 7.90496L47.0311 2.24335C47.8886 1.28194 50.4611 -0.854523 53.784 0.961462C56.766 2.59118 56.1422 6.1958 55.0703 7.90496L32.239 35.8926Z" fill="white"/>
                <path d="M25.5041 36H38.0418L25.5041 19.7244L33.7554 9.05367C36.0058 5.71232 32.148 0.107483 29.7905 0.107483H18.4315C24.261 1.14222 23.8967 5.92789 22.2893 7.86803L0 36H18.0029L14.2523 33.9521L18.8602 27.7005L25.5041 36Z" fill="white"/>
              </svg>
            </div>
            
            {/* Title and Description */}
            <div className="space-y-4">
              <h1 className="text-white text-3xl font-normal leading-snug">
                Human Resource
                <br />
                Management System
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                Streamline your HR operations with our comprehensive employee management,
                payroll processing, and attendance tracking system.
              </p>
            </div>
            
            {/* Contact Button */}
            <div>
              <button className="px-6 py-2.5 bg-white text-slate-900 rounded-3xl text-sm font-medium hover:bg-gray-100 transition-colors">
                Contact Administrator
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex items-center justify-center py-12 px-4 bg-white h-full">
        <div className="mx-auto w-full max-w-[420px] space-y-8">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <svg width="60" height="29" viewBox="0 0 75 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32.239 35.8926H55.7134C49.7108 34.7816 50.4254 30.1598 51.533 27.9877L74.3643 6.10352e-05H35.4546L42.3147 7.90496L47.0311 2.24335C47.8886 1.28194 50.4611 -0.854523 53.784 0.961462C56.766 2.59118 56.1422 6.1958 55.0703 7.90496L32.239 35.8926Z" fill="#1e293b"/>
              <path d="M25.5041 36H38.0418L25.5041 19.7244L33.7554 9.05367C36.0058 5.71232 32.148 0.107483 29.7905 0.107483H18.4315C24.261 1.14222 23.8967 5.92789 22.2893 7.86803L0 36H18.0029L14.2523 33.9521L18.8602 27.7005L25.5041 36Z" fill="#1e293b"/>
            </svg>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">
              Let's get you back to business.
            </h1>
            <p className="text-gray-500 text-sm">
              Empower your team with smart employee management, payroll tracking, and attendance automation.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Username
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="enter your username"
                autoComplete="email"
                {...register("email")}
                disabled={isPending}
                className="h-11 bg-gray-50 border-gray-200 placeholder:text-gray-400 focus:bg-white"
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="enter your password"
                autoComplete="current-password"
                {...register("password")}
                disabled={isPending}
                className="h-11 bg-gray-50 border-gray-200 placeholder:text-gray-400 focus:bg-white"
              />
              {errors.password && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("remember")}
                  className="w-4 h-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm text-gray-600">remember me</span>
              </label>
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-slate-900">
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            {errors.root && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 font-medium border border-red-100">
                {errors.root.message}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-md"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Login to dashboard"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            Need access? Please reach out to your administrator.
          </div>
        </div>
      </div>
    </div>
  );
}
