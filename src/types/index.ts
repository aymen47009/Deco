export type ProjectStatus =
  | 'new'
  | 'in_review'
  | 'approved'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'cancelled';

export type WorkerRole =
  | 'placo'
  | 'wood'
  | 'marble'
  | 'pvc'
  | 'demontable'
  | 'designer'
  | 'manager';

export type WorkerStatus = 'available' | 'busy' | 'on_leave' | 'inactive';

export type MaterialCategory =
  | 'placo'
  | 'wood'
  | 'marble'
  | 'pvc'
  | 'demontable'
  | 'tools'
  | 'other';

export interface SiteConfig {
  _id: string;
  logo: string;
  brandName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string;
  heroBadge: string;
  heroImage: string;
  sectionTitle: string;
  sectionSubtitle: string;
  ctaText: string;
  ctaPulse: boolean;
  footerText: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  galleryImages: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SiteConfigInput {
  logo?: string;
  brandName?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroTagline?: string;
  heroBadge?: string;
  heroImage?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  ctaText?: string;
  ctaPulse?: boolean;
  footerText?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
}

export interface Worker {
  _id: string;
  name: string;
  phone: string;
  role: WorkerRole;
  status: WorkerStatus;
  avatar: string;
  assignedProjects: Project[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkerInput {
  name: string;
  phone: string;
  role: WorkerRole;
  status?: WorkerStatus;
  avatar?: string;
}

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInput {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface Material {
  _id: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  stock: number;
  lowStockThreshold: number;
  pricePerUnit: number;
  supplier: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialInput {
  name: string;
  category: MaterialCategory;
  unit?: string;
  stock?: number;
  lowStockThreshold?: number;
  pricePerUnit?: number;
  supplier?: string;
}

export interface Project {
  _id: string;
  title: string;
  customer: string;
  phone: string;
  workshopType: string;
  spaceSize: string;
  budget: number | null;
  description: string;
  status: ProjectStatus;
  progress: number;
  images: string[];
  assignedWorkers: Worker[];
  preferredDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInput {
  title: string;
  customer: string;
  phone: string;
  workshopType: string;
  spaceSize?: string;
  budget?: number;
  description?: string;
  preferredDate?: string;
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

export const PROJECT_STATUSES = Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[];

export const WORKER_ROLE_LABELS: Record<WorkerRole, string> = {
  placo: 'بلاكو بلاتر',
  wood: 'بديل الخشب',
  marble: 'بديل الرخام',
  pvc: 'ألواح PVC',
  demontable: 'ديمونطابل',
  designer: 'مصمم',
  manager: 'مدير',
};

export const WORKER_ROLES = Object.keys(WORKER_ROLE_LABELS) as WorkerRole[];

export const WORKER_STATUS_LABELS: Record<WorkerStatus, string> = {
  available: 'متاح',
  busy: 'مشغول',
  on_leave: 'في إجازة',
  inactive: 'غير نشط',
};

export const WORKER_STATUSES = Object.keys(WORKER_STATUS_LABELS) as WorkerStatus[];

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  placo: 'بلاكو',
  wood: 'خشب',
  marble: 'رخام',
  pvc: 'PVC',
  demontable: 'ديمونطابل',
  tools: 'أدوات',
  other: 'أخرى',
};

export const MATERIAL_CATEGORIES = Object.keys(MATERIAL_CATEGORY_LABELS) as MaterialCategory[];

export const WORKSHOP_TYPES = [
  'بلاكو بلاتر',
  'بديل الخشب',
  'بديل الرخام',
  'ألواح PVC',
  'ديمونطابل',
  'أخرى',
];

export const SPACE_SIZES = [
  '10 م² - 30 م²',
  '30 م² - 60 م²',
  '60 م² - 100 م²',
  'أكثر من 100 م²',
];

export const DEFAULT_SITE_CONFIG: SiteConfigInput = {
  logo: '',
  brandName: 'ديكو ورشات',
  heroTitle: 'ألواح جدارية احترافية',
  heroSubtitle: 'بلاكو بلاتر، بديل الخشب، بديل الرخام، PVC، ديمونطابل',
  heroTagline: 'عمل احترافي — تسليم في الوقت — أسعار مناسبة',
  heroBadge: 'ديكو ورشات',
  heroImage: '',
  sectionTitle: 'نموذج طلب',
  sectionSubtitle: 'املأ النموذج وسنتواصل معك في أقرب وقت',
  ctaText: 'اطلب الآن',
  ctaPulse: true,
  footerText: '© ديكو ورشات — جميع الحقوق محفوظة',
  phone: '',
  whatsapp: '',
  instagram: '',
  facebook: '',
};
