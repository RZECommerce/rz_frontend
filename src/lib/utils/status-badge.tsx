import { Badge } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

type StatusBadgeProps = {
  status: string;
  children?: React.ReactNode;
};

export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const getVariant = (status: string): VariantProps<typeof Badge>["variant"] => {
    switch (status.toLowerCase()) {
      case "paid":
      case "approved":
      case "completed":
        return "default";
      case "processing":
      case "calculated":
        return "secondary";
      case "draft":
        return "outline";
      case "cancelled":
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const displayText = children || formatStatus(status);

  return <Badge variant={getVariant(status)}>{displayText}</Badge>;
}

export function CategoryBadge({ category }: { category: string }) {
  return <Badge variant="secondary">{category}</Badge>;
}
