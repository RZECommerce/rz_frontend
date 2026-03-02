import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth.service";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setUser(user); // setUser automatically sets isAuthenticated
        } else {
          setUser(null); // setUser(null) automatically sets isAuthenticated to false
        }
      } catch (error) {
        // User is not authenticated
        setUser(null); // setUser(null) automatically sets isAuthenticated to false
      }
    };

    checkAuth();
  }, [setUser]);

  return <>{children}</>;
}
