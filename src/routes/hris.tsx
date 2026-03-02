import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth/route-guards";

export const Route = createFileRoute("/hris")({
  beforeLoad: requireAuth(),
  component: HrisLayout,
});

function HrisLayout() {
  return <Outlet />;
}
