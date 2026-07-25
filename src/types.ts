export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface Project {
  id: string;
  name: string;
  customerId?: string | null;
  status?: string;
  description?: string;
  budget?: number;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export type ProjectStatus = "pending" | "in_progress" | "completed" | "on_hold" | "cancelled";

export const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
];
