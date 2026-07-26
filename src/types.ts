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

export type WorkType =
  | "placo"
  | "pvc"
  | "separation"
  | "marble"
  | "wood";

export type ProjectStatus = "pending" | "in_progress" | "validated" | "paid";
export type ImageCategory = "request" | "progress" | "completion";

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  placo: "بلاكو بلاتر",
  pvc: "بي في سي السقف",
  separation: "سيباراسيون",
  marble: "بديل الرخام",
  wood: "بديل الخشب",
};

export const WORK_TYPE_ICONS: Record<WorkType, string> = {
  placo: "🧱",
  pvc: "⚪",
  separation: "🪨",
  marble: "◈",
  wood: "🪵",
};

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
  workTypes: WorkType[];
  city: string;
  area: string;
  trackingCode: string;
  images: ProjectImage[];
  financials: Financials;
  validatedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

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
