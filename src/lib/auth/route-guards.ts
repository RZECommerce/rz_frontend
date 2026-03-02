/**
 * Route guards for TanStack Router
 * Replaces Next.js middleware functionality
 */

import { redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";
import { requireAuth as checkAuth } from "@/lib/auth-guard";

const publicPaths = ["/login", "/register"];

export function requireAuth() {
  return async ({ location }: { location: { pathname: string } }) => {
    if (typeof window === "undefined") return;
    
    const authState = useAuthStore.getState();
    
    // Allow public auth paths
    if (publicPaths.includes(location.pathname)) {
      // Redirect auth pages to dashboard if already authenticated
      if (authState.isAuthenticated && authState.user) {
        throw redirect({
          to: "/dashboard",
          replace: true,
        });
      }
      return;
    }

    // Protect all other routes - use the auth guard function
    // This will throw a redirect if not authenticated
    await checkAuth();
  };
}

