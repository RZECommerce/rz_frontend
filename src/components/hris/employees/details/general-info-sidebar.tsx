import { cn } from "@/lib/utils";

interface GeneralInfoSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  className?: string;
}

const sections = [
  { id: "basic", label: "Basic" },
  { id: "profile-picture", label: "Profile Picture" },
  { id: "immigration", label: "Immigration" },
  { id: "emergency-contacts", label: "Emergency Contacts" },
  { id: "social-profile", label: "Social Profile" },
  { id: "document", label: "Document" },
  { id: "qualification", label: "Qualification" },
  { id: "work-experience", label: "Work Experience" },
  { id: "bank-account", label: "Bank Account" },
];

export function GeneralInfoSidebar({
  activeSection,
  onSectionChange,
  className,
}: GeneralInfoSidebarProps) {
  return (
    <aside className={cn("w-64 border-r bg-background p-4", className)}>
      <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
        General Info
      </h2>
      <nav className="space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={cn(
              "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
              "hover:bg-muted",
              activeSection === section.id
                ? "bg-primary text-primary-foreground font-medium"
                : "text-foreground"
            )}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
