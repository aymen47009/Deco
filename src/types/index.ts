export interface SiteConfig {
  id: string;
  brand_name: string;
  brand_logo: string;
  tagline: string;
  hero_image: string;
  phone: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
  about_text: string;
  order_intro: string;
}

export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
}

export interface PortfolioItem {
  id: string;
  image: string;
  title: string;
  category: string;
  location: string;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
  sort_order: number;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string | null;
  workshop_type: string;
  space_size: string | null;
  budget: number | null;
  description: string;
  status: string;
  preferred_date: string | null;
  created_at: string;
}

export interface ProjectInput {
  name: string;
  phone: string;
  email?: string;
  workshop_type: string;
  space_size?: string;
  budget?: number;
  description?: string;
  preferred_date?: string;
}

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

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  new: 'جديد',
  in_review: 'قيد المراجعة',
  approved: 'مقبول',
  in_progress: 'قيد التنفيذ',
  review: 'للمراجعة',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export const PROJECT_STATUSES = Object.keys(PROJECT_STATUS_LABELS);

export const DEFAULT_CONFIG: SiteConfig = {
  id: '',
  brand_name: 'ديكو بانيلز',
  brand_logo: 'DP',
  tagline: 'ألواح جدارية احترافية — بلاكو بلاتر، بديل الخشب، بديل الرخام، PVC، ديمونطابل',
  hero_image: 'https://images.pexels.com/photos/6585758/pexels-photo-6585758.jpeg?auto=compress&cs=tinysrgb&w=1600',
  phone: '0770000000',
  email: 'info@decopanels.com',
  address: 'بغداد، العراق',
  instagram: '#',
  facebook: '#',
  whatsapp: '#',
  about_text: 'نقدم حلول الألواح الجدارية الاحترافية لجميع المساحات. لدينا خبرة في تركيب وتصميم البلاكو بلاتر، بدائل الخشب، بدائل الرخام، ألواح PVC، والديمونطابل. نلتزم بالعمل الاحترافي والتسليم في الوقت المناسب.',
  order_intro: 'املأ النموذج التالي وسنتواصل معك في أقرب وقت',
};
