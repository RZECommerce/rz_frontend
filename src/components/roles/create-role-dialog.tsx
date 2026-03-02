
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { roleService } from "@/services/role.service";
import type { Permission, PermissionsByGroup } from "@/types/role";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyboardArrowDown as ArrowDown01Icon, KeyboardArrowUp as ArrowUp01Icon } from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createRoleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().optional(),
  permission_ids: z.array(z.string()),
});

type CreateRoleFormData = z.infer<typeof createRoleSchema>;

/**
 * Map permission groups to their main category/module
 */
function getCategoryFromGroup(group: string): string {
  // HRIS permissions
  const hrisGroups = [
    "employees",
    "attendance",
    "leaves",
    "holidays",
    "payroll",
    "reports",
    "departments",
    "positions",
    "reference",
    "reimbursements",
  ];
  if (hrisGroups.includes(group)) return "HRIS";

  // Accounts permissions
  const accountsGroups = ["vendors"];
  if (accountsGroups.includes(group)) return "Accounts";

  // Operations permissions
  const operationsGroups = [
    "inventory",
    "purchase-orders",
    "goods-receipt-notes",
    "purchase-requisitions",
  ];
  if (operationsGroups.includes(group)) return "Operations";

  // Sales permissions
  const salesGroups = ["leads", "campaign", "logistics", "retention"];
  if (salesGroups.includes(group)) return "Sales";

  // Ecommerce permissions
  const ecommerceGroups = ["products", "orders", "stores"];
  if (ecommerceGroups.includes(group)) return "Ecommerce";

  // CRM permissions
  const crmGroups = [
    "analytics",
    "messenger",
    "chat-sales",
    "tele-sales",
    "facebook-pages",
    "multi-platform",
    "quality-assurance",
    "facebook-conversations",
  ];
  if (crmGroups.includes(group)) return "CRM";

  // User Management permissions
  const userManagementGroups = ["users", "roles"];
  if (userManagementGroups.includes(group)) return "User Management";

  // Others
  return "Others";
}

/**
 * Group permissions by category
 */
function groupPermissionsByCategory(
  permissions: PermissionsByGroup
): Record<string, PermissionsByGroup> {
  const categorized: Record<string, PermissionsByGroup> = {};

  for (const group in permissions) {
    const category = getCategoryFromGroup(group);
    if (!categorized[category]) {
      categorized[category] = {};
    }
    categorized[category][group] = permissions[group];
  }

  // Sort categories in a specific order
  const categoryOrder = [
    "HRIS",
    "Sales",
    "Ecommerce",
    "CRM",
    "User Management",
    "Others",
  ];

  const sorted: Record<string, PermissionsByGroup> = {};
  for (const category of categoryOrder) {
    if (categorized[category]) {
      sorted[category] = categorized[category];
    }
  }
  // Add any remaining categories
  for (const category in categorized) {
    if (!sorted[category]) {
      sorted[category] = categorized[category];
    }
  }

  return sorted;
}

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissions: PermissionsByGroup;
}

export function CreateRoleDialog({ open, onOpenChange, permissions }: CreateRoleDialogProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger,
  } = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      permission_ids: [],
    },
  });

  // Group permissions by category
  const categorizedPermissions = useMemo(
    () => groupPermissionsByCategory(permissions),
    [permissions]
  );

  const categories = Object.keys(categorizedPermissions);

  // Reset to basic tab when dialog opens
  useEffect(() => {
    if (open) {
      setActiveTab("basic");
      setSelectedPermissions([]);
      setExpandedCategories(new Set());
      reset();
    }
  }, [open, reset]);

  const toggleCategoryExpand = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const createRole = useMutation({
    mutationFn: roleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role created successfully");
      reset();
      setSelectedPermissions([]);
      setActiveTab("basic");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to create role", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const onSubmit = (data: CreateRoleFormData) => {
    // Validate basic fields first
    trigger(["name", "slug"]).then((isValid) => {
      if (!isValid) {
        // Switch to basic tab if validation fails
        setActiveTab("basic");
        return;
      }

      // Validate permissions
      if (selectedPermissions.length === 0) {
        toast.error("Please select at least one permission for this role");
        setActiveTab("permissions");
        return;
      }

      // Submit the form
      createRole.mutate({
        ...data,
        permission_ids: selectedPermissions,
      });
    });
  };

  const updateSelection = (next: string[]) => {
    setSelectedPermissions(next);
    setValue("permission_ids", next);
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      const next = prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId];
      setValue("permission_ids", next);
      return next;
    });
  };

  const toggleGroup = (category: string, group: string, checked: boolean) => {
    const groupIds = categorizedPermissions[category][group].map((p) => p.id);
    setSelectedPermissions((prev) => {
      let next: string[];
      if (checked) {
        const set = new Set([...prev, ...groupIds]);
        next = Array.from(set);
      } else {
        next = prev.filter((id) => !groupIds.includes(id));
      }
      setValue("permission_ids", next);
      return next;
    });
  };

  const toggleCategory = (category: string, checked: boolean) => {
    const categoryPermissions: Permission[] = [];
    for (const group in categorizedPermissions[category]) {
      categoryPermissions.push(...categorizedPermissions[category][group]);
    }
    const categoryIds = categoryPermissions.map((p) => p.id);
    setSelectedPermissions((prev) => {
      let next: string[];
      if (checked) {
        const set = new Set([...prev, ...categoryIds]);
        next = Array.from(set);
      } else {
        next = prev.filter((id) => !categoryIds.includes(id));
      }
      setValue("permission_ids", next);
      return next;
    });
  };

  const handleCancel = () => {
    reset();
    setSelectedPermissions([]);
    setActiveTab("basic");
    onOpenChange(false);
  };

  const allPermissionIds = useMemo(() => {
    return categories.flatMap((category) =>
      Object.values(categorizedPermissions[category]).flatMap((group) =>
        group.map((p) => p.id)
      )
    );
  }, [categories, categorizedPermissions]);

  const allSelected =
    allPermissionIds.length > 0 &&
    allPermissionIds.every((id) => selectedPermissions.includes(id));

  const toggleAll = (checked: boolean) => {
    if (checked) {
      updateSelection(allPermissionIds);
    } else {
      updateSelection([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Create a new role and assign permissions to it
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <div className="max-h-[60vh] overflow-y-auto pr-4 mt-4">
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g., HR Manager"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    {...register("slug")}
                    placeholder="e.g., hr-manager"
                  />
                  {errors.slug && (
                    <p className="text-sm text-destructive">{errors.slug.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Lowercase alphanumeric with hyphens only
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Role description..."
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <Label>Permissions</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="perm-select-all"
                      checked={allSelected}
                      onCheckedChange={(checked) => toggleAll(Boolean(checked))}
                    />
                    <label
                      htmlFor="perm-select-all"
                      className="text-xs text-muted-foreground cursor-pointer"
                    >
                      Select all
                    </label>
                  </div>
                </div>

                {categories.map((category) => {
                  const categoryPermissions: Permission[] = [];
                  for (const group in categorizedPermissions[category]) {
                    categoryPermissions.push(...categorizedPermissions[category][group]);
                  }
                  const allCategorySelected =
                    categoryPermissions.length > 0 &&
                    categoryPermissions.every((p) => selectedPermissions.includes(p.id));
                  const isExpanded = expandedCategories.has(category);

                  return (
                    <Collapsible
                      key={category}
                      open={isExpanded}
                      onOpenChange={() => toggleCategoryExpand(category)}
                    >
                      <div className="border rounded-md overflow-hidden hover:border-primary/50 transition-colors">
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between px-3 py-2 hover:bg-muted/60 transition-colors">
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ArrowUp01Icon className="size-5 text-muted-foreground" />
                              ) : (
                                <ArrowDown01Icon className="size-5 text-muted-foreground" />
                              )}
                              <h3 className="font-medium text-sm">{category}</h3>
                            </div>
                            <div
                              className="flex items-center space-x-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                id={`perm-category-${category}`}
                                checked={allCategorySelected}
                                onCheckedChange={(checked) =>
                                  toggleCategory(category, Boolean(checked))
                                }
                              />
                              <label
                                htmlFor={`perm-category-${category}`}
                                className="text-xs text-muted-foreground cursor-pointer"
                              >
                                Select all {category}
                              </label>
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="space-y-2 px-3 pb-3 border-t bg-background">
                            {Object.keys(categorizedPermissions[category]).map((group) => {
                              const groupPermissions = categorizedPermissions[category][group];
                              const allGroupSelected =
                                groupPermissions.length > 0 &&
                                groupPermissions.every((p) =>
                                  selectedPermissions.includes(p.id)
                                );

                              return (
                                <div key={group} className="space-y-1 pt-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-xs capitalize text-muted-foreground">
                                      {group}
                                    </h4>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`perm-group-${category}-${group}`}
                                        checked={allGroupSelected}
                                        onCheckedChange={(checked) =>
                                          toggleGroup(category, group, Boolean(checked))
                                        }
                                      />
                                      <label
                                        htmlFor={`perm-group-${category}-${group}`}
                                        className="text-xs text-muted-foreground cursor-pointer"
                                      >
                                        Select all
                                      </label>
                                    </div>
                                  </div>
                                  <div className="space-y-1 pl-4">
                                    {groupPermissions.map((permission) => (
                                      <div
                                        key={permission.id}
                                        className="flex items-center space-x-2"
                                      >
                                        <Checkbox
                                          id={`perm-${permission.id}`}
                                          checked={selectedPermissions.includes(permission.id)}
                                          onCheckedChange={() => togglePermission(permission.id)}
                                        />
                                        <label
                                          htmlFor={`perm-${permission.id}`}
                                          className="text-xs font-normal cursor-pointer"
                                        >
                                          {permission.name}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}

                {errors.permission_ids && (
                  <p className="text-sm text-destructive">
                    {errors.permission_ids.message}
                  </p>
                )}
              </TabsContent>
            </div>
          </Tabs>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRole.isPending}>
              {createRole.isPending ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

