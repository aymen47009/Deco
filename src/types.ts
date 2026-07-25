export type PropertyType = "home" | "workshop" | "shop";

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  home: "منزل",
  workshop: "ورشة",
  shop: "محل",
};

export type JobStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "inspection"
  | "done"
  | "cancelled";

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending: "بانتظار الموافقة",
  assigned: "تم التعيين",
  in_progress: "قيد التنفيذ",
  inspection: "الفحص",
  done: "مكتمل",
  cancelled: "ملغى",
};

export type JobComplexity = "simple" | "medium" | "complex";

export const JOB_COMPLEXITY_LABELS: Record<JobComplexity, string> = {
  simple: "بسيط",
  medium: "متوسط",
  complex: "معقد",
};

export type ReturnMethod = "pickup" | "delivery";

export const RETURN_METHOD_LABELS: Record<ReturnMethod, string> = {
  pickup: "استلام من الورشة",
  delivery: "توصيل للعميل",
};

export type MaterialCategory =
  | "paint"
  | "wood"
  | "metal"
  | "tools"
  | "fabric"
  | "other";

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  paint: "دهانات",
  wood: "أخشاب",
  metal: "معادن",
  tools: "أدوات",
  fabric: "أقمشة",
  other: "أخرى",
};

export interface Customer {
  id: string;
  name: string;
  phone: string;
  city: string;
  createdAt: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  city: string;
  specialty: string;
  rating: number;
  jobsCompleted: number;
  createdAt: string;
}

export interface MaterialUsage {
  materialId: string;
  quantity: number;
}

export interface JobBid {
  workerId: string;
  amount: number;
  note?: string;
  createdAt: string;
}

export interface InspectionData {
  passed: boolean;
  notes: string;
  inspectorId: string;
  date: string;
}

export interface ExecutionData {
  startDate: string;
  endDate?: string;
  progress: number;
}

export interface Job {
  id: string;
  customerId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  city: string;
  status: JobStatus;
  complexity: JobComplexity;
  returnMethod: ReturnMethod;
  assignedWorkerId?: string;
  bids: JobBid[];
  price?: number;
  materials: MaterialUsage[];
  inspection?: InspectionData;
  execution?: ExecutionData;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  stock: number;
  minStock: number;
  price: number;
  createdAt: string;
}

export interface AppData {
  customers: Customer[];
  workers: Worker[];
  jobs: Job[];
  materials: Material[];
}

export interface User {
  id: string;
  email: string;
  role: "admin" | "worker" | "customer";
  name: string;
}
