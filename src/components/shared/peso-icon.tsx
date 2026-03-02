import { cn } from "@/lib/utils";

interface PesoIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

export function PesoIcon({ className, ...props }: PesoIconProps) {
  return (
    <span 
      className={cn("inline-flex items-center justify-center font-bold text-current", className)} 
      {...props}
    >
      ₱
    </span>
  );
}
