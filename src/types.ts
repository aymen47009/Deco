export interface User {
  _id: string;
  name: string;
  phone: string;
  role: "admin" | "worker";
  totalEarnings?: number;
  pendingDues?: number;
  active?: boolean;
}

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  city: string;
  notes?: string;
  createdAt?: string;
}

export type ProjectType = "decor" | "placo" | "pmma" | "other";
export type ProjectStatus = "pending" | "in_progress" | "validated" | "paid";
export type ImageCategory = "request" | "progress" | "completion";

export interface ProjectImage {
  _id?: string;
  url: string;
  category: ImageCategory;
  uploadedAt?: string;
}

export interface Financials {
  totalCost: number;
  workerFee: number;
  customerPaid: boolean;
  workerPaid: boolean;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  customerId: string;
  customer?: Customer;
  workerId?: string;
  worker?: User;
  status: ProjectStatus;
  type: ProjectType;
  city: string;
  area: number;
  images: ProjectImage[];
  financials: Financials;
  validatedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  decor: "ديكور",
  placo: "بلاكو بلاتر",
  pmma: "PMMA",
  other: "أخرى",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  pending: "بانتظار المراجعة",
  in_progress: "قيد التنفيذ",
  validated: "تمت المصادقة",
  paid: "مكتمل الدفع",
};

export const STATUS_STYLES: Record<ProjectStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  validated: "bg-emerald-100 text-emerald-700",
  paid: "bg-brand-200 text-brand-800",
};

export const IMAGE_CATEGORY_LABELS: Record<ImageCategory, string> = {
  request: "صور الطلب",
  progress: "صور التقدم",
  completion: "صور الإنجاز",
};
