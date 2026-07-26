export type ProjectStatus =
  | 'new'
  | 'in_review'
  | 'approved'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'cancelled';

export type PropertyType =
  | 'apartment'
  | 'villa'
  | 'office'
  | 'shop'
  | 'restaurant'
  | 'other';

export type WorkType =
  | 'full_renovation'
  | 'kitchen'
  | 'bathroom'
  | 'painting'
  | 'flooring'
  | 'ceiling'
  | 'custom';

export type WorkerRole =
  | 'carpenter'
  | 'painter'
  | 'electrician'
  | 'plumber'
  | 'tiler'
  | 'general'
  | 'manager';

export type WorkerStatus = 'available' | 'busy' | 'offline';

export type MaterialCategory =
  | 'wood'
  | 'paint'
  | 'tile'
  | 'electrical'
  | 'plumbing'
  | 'hardware'
  | 'other';

export interface WorkerRef {
  _id: string;
  name: string;
  role: WorkerRole;
  status: WorkerStatus;
}

export interface ProjectMaterial {
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface ProjectImage {
  url: string;
  publicId: string;
}

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  company?: string;
  notes?: string;
  projectIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  code: string;
  title: string;
  description: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  propertyType: PropertyType;
  workType: WorkType;
  budget: number;
  status: ProjectStatus;
  assignedWorkers: WorkerRef[];
  materials: ProjectMaterial[];
  images: ProjectImage[];
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  progress: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInput {
  code?: string;
  title: string;
  description?: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  propertyType?: PropertyType;
  workType?: WorkType;
  budget?: number;
  status?: ProjectStatus;
  materials?: ProjectMaterial[];
  images?: ProjectImage[];
  startDate?: string;
  expectedEndDate?: string;
  notes?: string;
}

export interface Worker {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: WorkerRole;
  skills: string[];
  status: WorkerStatus;
  assignedProjects: Array<{
    _id: string;
    code: string;
    title: string;
    status: ProjectStatus;
  }>;
  dailyRate: number;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerInput {
  name: string;
  phone?: string;
  email?: string;
  role?: WorkerRole;
  skills?: string[];
  status?: WorkerStatus;
  dailyRate?: number;
  avatar?: string;
}

export interface Material {
  _id: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  stock: number;
  minStock: number;
  unitCost: number;
  supplier: string;
  lastRestocked?: string;
  lowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialInput {
  name: string;
  category?: MaterialCategory;
  unit?: string;
  stock?: number;
  minStock?: number;
  unitCost?: number;
  supplier?: string;
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  new: 'جديد',
  in_review: 'قيد المراجعة',
  approved: 'مقبول',
  in_progress: 'قيد التنفيذ',
  review: 'للمراجعة',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'شقة',
  villa: 'فيلا',
  office: 'مكتب',
  shop: 'محل',
  restaurant: 'مطعم',
  other: 'أخرى',
};

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  full_renovation: 'تجديد شامل',
  kitchen: 'مطبخ',
  bathroom: 'حمام',
  painting: 'دهانات',
  flooring: 'أرضيات',
  ceiling: 'أسقف',
  custom: 'مخصص',
};

export const WORKER_ROLE_LABELS: Record<WorkerRole, string> = {
  carpenter: 'نجار',
  painter: 'دهان',
  electrician: 'كهربائي',
  plumber: 'سباك',
  tiler: 'بلاط',
  general: 'عامل عام',
  manager: 'مدير',
};

export const WORKER_STATUS_LABELS: Record<WorkerStatus, string> = {
  available: 'متاح',
  busy: 'مشغول',
  offline: 'غير متصل',
};

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  wood: 'أخشاب',
  paint: 'دهانات',
  tile: 'بلاط',
  electrical: 'كهرباء',
  plumbing: 'سباكة',
  hardware: 'أدوات',
  other: 'أخرى',
};

export const PROJECT_STATUSES = Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[];
export const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[];
export const WORK_TYPES = Object.keys(WORK_TYPE_LABELS) as WorkType[];
export const WORKER_ROLES = Object.keys(WORKER_ROLE_LABELS) as WorkerRole[];
export const WORKER_STATUSES = Object.keys(WORKER_STATUS_LABELS) as WorkerStatus[];
export const MATERIAL_CATEGORIES = Object.keys(MATERIAL_CATEGORY_LABELS) as MaterialCategory[];
