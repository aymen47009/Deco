import type {
  Project, ProjectInput, ProjectStatus,
  ProjectMaterialInput, ProjectPaymentInput, ArtisanWageInput,
  ArtisanTaskInput, ArtisanSummary,
  ClientTrackingData,
  Worker, WorkerInput, WorkerStatus,
  Material, MaterialInput,
  SiteConfig, SiteConfigInput,
  GalleryImage, GalleryCategory,
} from '../types';

const API_BASE = '/api';
const AUTH_TOKEN_KEY = 'deco-artisan-token';

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function login(phone: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try { const data = await res.json(); message = data.error || message; } catch { /* ignore */ }
    throw new Error(message);
  }
  return res.json() as Promise<{ token: string; user: { _id: string; name: string; phone: string; role: string } }>;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try { const data = await res.json(); message = data.error || message; } catch { /* ignore */ }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

async function authRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && !(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try { const data = await res.json(); message = data.error || message; } catch { /* ignore */ }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getProjects: (status?: string) =>
    request<Project[]>(`/projects${status ? `?status=${status}` : ''}`),
  createProject: (data: ProjectInput) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProjectStatus: (id: string, status: ProjectStatus) =>
    request<Project>(`/projects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateProjectProgress: (id: string, progress: number) =>
    request<Project>(`/projects/${id}/progress`, { method: 'PATCH', body: JSON.stringify({ progress }) }),
  assignProjectArtisan: (id: string, artisanId: string) =>
    request<Project>(`/projects/${id}/assign-artisan`, { method: 'PATCH', body: JSON.stringify({ artisanId }) }),
  deleteProject: (id: string) =>
    request<{ message: string }>(`/projects/${id}`, { method: 'DELETE' }),
  getProject: (id: string) =>
    request<Project>(`/projects/${id}`),
  updateProject: (id: string, data: Partial<ProjectInput>) =>
    request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  addProjectMaterial: (id: string, data: ProjectMaterialInput) =>
    request<Project>(`/projects/${id}/materials`, { method: 'POST', body: JSON.stringify(data) }),
  removeProjectMaterial: (id: string, index: number) =>
    request<{ message: string }>(`/projects/${id}/materials/${index}`, { method: 'DELETE' }),
  addProjectPayment: (id: string, data: ProjectPaymentInput) =>
    request<Project>(`/projects/${id}/payments`, { method: 'POST', body: JSON.stringify(data) }),
  updateProjectPayment: (id: string, payIndex: number, data: ProjectPaymentInput & { isVerified?: boolean }) =>
    request<Project>(`/projects/${id}/payments/${payIndex}`, { method: 'PATCH', body: JSON.stringify(data) }),
  verifyProjectPayment: (id: string, payIndex: number) =>
    request<Project>(`/projects/${id}/payments/${payIndex}/verify`, { method: 'PATCH', body: JSON.stringify({}) }),
  updateArtisanWage: (id: string, data: ArtisanWageInput) =>
    request<Project>(`/projects/${id}/artisan-wage`, { method: 'PATCH', body: JSON.stringify(data) }),
  getArtisans: () => request<ArtisanSummary[]>('/auth/artisans'),
  uploadProjectMedia: (id: string, file: File, stage: string, visibleToClient: boolean, uploadedBy: string) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('stage', stage);
    formData.append('visibleToClient', String(visibleToClient));
    formData.append('uploadedBy', uploadedBy);
    return fetch(`${API_BASE}/projects/${id}/media`, { method: 'POST', body: formData }).then((r) => {
      if (!r.ok) throw new Error('Upload failed');
      return r.json() as Promise<Project>;
    });
  },
  deleteProjectMedia: (id: string, mediaId: string) =>
    request<{ message: string }>(`/projects/${id}/media/${mediaId}`, { method: 'DELETE' }),

  getClientTracking: (token: string) =>
    request<ClientTrackingData>(`/client/track/${token}`),

  loginArtisan: async (phone: string, password: string) => {
    const result = await login(phone, password);
    setAuthToken(result.token);
    return result;
  },
  logoutArtisan: () => clearAuthToken(),
  getAuthUser: () => authRequest<{ _id: string; name: string; phone: string; role: string }>('/auth/me'),
  getArtisanProjects: () => authRequest<Project[]>('/artisans/projects'),
  addArtisanTask: (projectId: string, data: ArtisanTaskInput) =>
    authRequest<Project>(`/artisans/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  addArtisanPayment: (projectId: string, amount: number, date?: string) =>
    authRequest<Project>(`/artisans/projects/${projectId}/payments`, { method: 'POST', body: JSON.stringify({ amount, date }) }),
  uploadArtisanMedia: (projectId: string, file: File, stage: string, visibleToClient: boolean) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('stage', stage);
    formData.append('visibleToClient', String(visibleToClient));
    return authRequest<Project>(`/artisans/projects/${projectId}/media`, { method: 'POST', body: formData });
  },

  getWorkers: (filters?: { status?: WorkerStatus; role?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.role) params.set('role', filters.role);
    const qs = params.toString();
    return request<Worker[]>(`/workers${qs ? `?${qs}` : ''}`);
  },
  getWorkerByPhone: (phone: string) =>
    request<Worker & { assignedProjects: Project[] }>(`/workers/phone/${encodeURIComponent(phone)}`),
  createWorker: (data: WorkerInput) =>
    request<Worker>('/workers', { method: 'POST', body: JSON.stringify(data) }),
  updateWorker: (id: string, data: Partial<WorkerInput>) =>
    request<Worker>(`/workers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateWorkerStatus: (id: string, status: WorkerStatus) =>
    request<Worker>(`/workers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteWorker: (id: string) =>
    request<{ message: string }>(`/workers/${id}`, { method: 'DELETE' }),

  getMaterials: (filters?: { category?: string; lowStock?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.lowStock) params.set('lowStock', 'true');
    const qs = params.toString();
    return request<Material[]>(`/materials${qs ? `?${qs}` : ''}`);
  },
  createMaterial: (data: MaterialInput) =>
    request<Material>('/materials', { method: 'POST', body: JSON.stringify(data) }),
  updateMaterial: (id: string, data: Partial<MaterialInput>) =>
    request<Material>(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMaterial: (id: string) =>
    request<{ message: string }>(`/materials/${id}`, { method: 'DELETE' }),

  getSiteConfig: () => request<SiteConfig>('/siteconfig'),
  updateSiteConfig: (data: SiteConfigInput) =>
    request<SiteConfig>('/siteconfig', { method: 'PUT', body: JSON.stringify(data) }),
  uploadSiteImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return fetch(`${API_BASE}/siteconfig/upload`, { method: 'POST', body: formData }).then((r) => {
      if (!r.ok) throw new Error('Upload failed');
      return r.json() as Promise<{ url: string }>;
    });
  },

  getGalleryImages: (category?: GalleryCategory) =>
    request<GalleryImage[]>(`/gallery${category ? `?category=${category}` : ''}`),
  uploadGalleryImage: (file: File, category: GalleryCategory, title?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);
    if (title) formData.append('title', title);
    return fetch(`${API_BASE}/gallery`, { method: 'POST', body: formData }).then((r) => {
      if (!r.ok) throw new Error('Upload failed');
      return r.json() as Promise<GalleryImage>;
    });
  },
  deleteGalleryImage: (id: string) =>
    request<{ message: string }>(`/gallery/${id}`, { method: 'DELETE' }),
  updateGalleryImageOrder: (id: string, order: number) =>
    request<GalleryImage>(`/gallery/${id}/order`, { method: 'PATCH', body: JSON.stringify({ order }) }),
};
