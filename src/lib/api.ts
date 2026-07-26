import type {
  Project,
  ProjectInput,
  Worker,
  WorkerInput,
  Customer,
  Material,
  MaterialInput,
  ProjectStatus,
  WorkerStatus,
} from '../types';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.error || message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  // Projects
  getProjects: (params?: { status?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status && params.status !== 'all') qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    const query = qs.toString();
    return request<Project[]>(`/projects${query ? `?${query}` : ''}`);
  },

  getProject: (id: string) => request<Project>(`/projects/${id}`),

  getProjectByCode: (code: string) => request<Project>(`/projects/code/${code}`),

  createProject: (data: ProjectInput) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),

  updateProject: (id: string, data: Partial<ProjectInput>) =>
    request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  updateProjectStatus: (id: string, status: ProjectStatus) =>
    request<Project>(`/projects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  assignWorker: (projectId: string, workerId: string) =>
    request<Project>(`/projects/${projectId}/workers`, {
      method: 'POST',
      body: JSON.stringify({ workerId }),
    }),

  removeWorker: (projectId: string, workerId: string) =>
    request<Project>(`/projects/${projectId}/workers/${workerId}`, { method: 'DELETE' }),

  deleteProject: (id: string) => request<{ message: string }>(`/projects/${id}`, { method: 'DELETE' }),

  // Workers
  getWorkers: (params?: { status?: string; role?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status && params.status !== 'all') qs.set('status', params.status);
    if (params?.role && params.role !== 'all') qs.set('role', params.role);
    if (params?.search) qs.set('search', params.search);
    const query = qs.toString();
    return request<Worker[]>(`/workers${query ? `?${query}` : ''}`);
  },

  getWorker: (id: string) => request<Worker>(`/workers/${id}`),

  createWorker: (data: WorkerInput) =>
    request<Worker>('/workers', { method: 'POST', body: JSON.stringify(data) }),

  updateWorker: (id: string, data: Partial<WorkerInput>) =>
    request<Worker>(`/workers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  updateWorkerStatus: (id: string, status: WorkerStatus) =>
    request<Worker>(`/workers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  deleteWorker: (id: string) => request<{ message: string }>(`/workers/${id}`, { method: 'DELETE' }),

  // Customers
  getCustomers: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<Customer[]>(`/customers${qs}`);
  },

  getCustomer: (id: string) => request<Customer>(`/customers/${id}`),

  createCustomer: (data: Partial<Customer>) =>
    request<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),

  updateCustomer: (id: string, data: Partial<Customer>) =>
    request<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteCustomer: (id: string) =>
    request<{ message: string }>(`/customers/${id}`, { method: 'DELETE' }),

  // Materials
  getMaterials: (params?: { category?: string; lowStock?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.category && params.category !== 'all') qs.set('category', params.category);
    if (params?.lowStock) qs.set('lowStock', 'true');
    const query = qs.toString();
    return request<Material[]>(`/materials${query ? `?${query}` : ''}`);
  },

  createMaterial: (data: MaterialInput) =>
    request<Material>('/materials', { method: 'POST', body: JSON.stringify(data) }),

  updateMaterial: (id: string, data: Partial<MaterialInput>) =>
    request<Material>(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  restockMaterial: (id: string, quantity: number) =>
    request<Material>(`/materials/${id}/restock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),

  deleteMaterial: (id: string) =>
    request<{ message: string }>(`/materials/${id}`, { method: 'DELETE' }),

  // Upload
  uploadImages: async (files: File[]): Promise<{ url: string; publicId: string }[]> => {
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.images;
  },
};
