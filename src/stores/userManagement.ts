/**
 * User Management store
 * Manages user form state and validation
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_ids: number[];
}

interface UserManagementState {
  formData: UserFormData;
  errors: Partial<Record<keyof UserFormData, string>>;
  isOpen: boolean;
}

interface UserManagementActions {
  setFormData: (data: UserFormData) => void;
  updateField: (field: keyof UserFormData, value: string | number[]) => void;
  updateRoleIds: (roleIds: number[]) => void;
  setError: (field: keyof UserFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof UserFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof UserFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;
}

const initialFormData: UserFormData = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  role_ids: [],
};

export const useUserManagementStore = create<UserManagementState & UserManagementActions>()(
  devtools(
    (set, get) => ({
      formData: initialFormData,
      errors: {},
      isOpen: false,

      setFormData: (data) =>
        set({ formData: data }),

      updateField: (field, value) =>
        set((state) => {
          const newFormData = { ...state.formData, [field]: value };
          const newErrors = { ...state.errors };
          delete newErrors[field]; // Clear error when field is updated
          return { formData: newFormData, errors: newErrors };
        }),

      updateRoleIds: (roleIds) =>
        set((state) => ({
          formData: { ...state.formData, role_ids: roleIds },
        })),

      setError: (field, error) =>
        set((state) => ({
          errors: { ...state.errors, [field]: error },
        })),

      setErrors: (errors) =>
        set({ errors }),

      clearErrors: () =>
        set({ errors: {} }),

      clearError: (field) =>
        set((state) => {
          const newErrors = { ...state.errors };
          delete newErrors[field];
          return { errors: newErrors };
        }),

      resetForm: () =>
        set({
          formData: initialFormData,
          errors: {},
        }),

      setIsOpen: (open) =>
        set((state) => {
          if (!open) {
            // Reset form when dialog closes
            return {
              isOpen: open,
              formData: initialFormData,
              errors: {},
            };
          }
          return { isOpen: open };
        }),

      validateForm: () => {
        const { formData } = get();
        const errors: Partial<Record<keyof UserFormData, string>> = {};

        // Validate name
        if (!formData.name.trim()) {
          errors.name = "Name is required";
        }

        // Validate email
        if (!formData.email.trim()) {
          errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = "Invalid email format";
        }

        // Validate password
        if (!formData.password) {
          errors.password = "Password is required";
        } else if (formData.password.length < 8) {
          errors.password = "Password must be at least 8 characters";
        }

        // Validate password confirmation
        if (!formData.password_confirmation) {
          errors.password_confirmation = "Password confirmation is required";
        } else if (formData.password !== formData.password_confirmation) {
          errors.password_confirmation = "Passwords do not match";
        }

        set({ errors });

        return Object.keys(errors).length === 0;
      },
    }),
    { name: "user-management-store" }
  )
);
