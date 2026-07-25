export interface Customer {
  _id: string;
  name: string;
  phone: string;
  city: string;
  notes?: string;
  createdAt?: string;
}

export type ProjectType = "decor" | "pmma" | "placo" | "other";
export type ProjectStatus = "pending" | "in_progress" | "done" | "cancelled";

export interface Project {
  _id: string;
  code: string;
  title: string;
  customerId: string;
  customer?: Customer;
  city: string;
  area: number;
  type: ProjectType;
  status: ProjectStatus;
  images: string[];
  notes: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  decor: "ديكور",
  pmma: "PMMA",
  placo: "بلاكو بلاتر",
  other: "أخرى",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  pending: "بانتظار البدء",
  in_progress: "قيد التنفيذ",
  done: "مكتمل",
  cancelled: "ملغى",
};

export const STATUS_STYLES: Record<ProjectStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  in_progress: "bg-indigo-100 text-indigo-700",
  done: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};
