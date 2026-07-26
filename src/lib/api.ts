import type {
  Project, ProjectInput, ProjectStatus,
  Worker, WorkerInput, WorkerStatus,
  Customer, CustomerInput,
  Material, MaterialInput,
} from '../types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getProjects: (status?: string) =>
    request<Project[]>(`/projects${status ? `?status=${status}` : ''}`),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  createProject: (data: ProjectInput) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: Partial<ProjectInput>) =>
    request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateProjectStatus: (id: string, status: ProjectStatus) =>
    request<Project>(`/projects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateProjectProgress: (id: string, progress: number) =>
    request<Project>(`/projects/${id}/progress`, { method: 'PATCH', body: JSON.stringify({ progress }) }),
  deleteProject: (id: string) =>
    request<{ message: string }>(`/projects/${id}`, { method: 'DELETE' }),
  uploadProjectImages: (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    return fetch(`${API_BASE}/projects/${id}/upload`, { method: 'POST', body: formData }).then((r) => {
      if (!r.ok) throw new Error('Upload failed');
      return r.json() as Promise<Project>;
    });
  },

  getWorkers: (filters?: { status?: WorkerStatus; role?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.role) params.set('role', filters.role);
    const qs = params.toString();
    return request<Worker[]>(`/workers${qs ? `?${qs}` : ''}`);
  },
  getWorker: (id: string) => request<Worker>(`/workers/${id}`),
  createWorker: (data: WorkerInput) =>
    request<Worker>('/workers', { method: 'POST', body: JSON.stringify(data) }),
  updateWorker: (id: string, data: Partial<WorkerInput>) =>
    request<Worker>(`/workers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateWorkerStatus: (id: string, status: WorkerStatus) =>
    request<Worker>(`/workers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteWorker: (id: string) =>
    request<{ message: string }>(`/workers/${id}`, { method: 'DELETE' }),

  getCustomers: () => request<Customer[]>('/customers'),
  getCustomer: (id: string) => request<Customer>(`/customers/${id}`),
  createCustomer: (data: CustomerInput) =>
    request<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: string, data: Partial<CustomerInput>) =>
    request<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id: string) =>
    request<{ message: string }>(`/customers/${id}`, { method: 'DELETE' }),

  getMaterials: (filters?: { category?: string; lowStock?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.lowStock) params.set('lowStock', 'true');
    const qs = params.toString();
    return request<Material[]>(`/materials${qs ? `?${qs}` : ''}`);
  },
  getMaterial: (id: string) => request<Material>(`/materials/${id}`),
  createMaterial: (data: MaterialInput) =>
    request<Material>('/materials', { method: 'POST', body: JSON.stringify(data) }),
  updateMaterial: (id: string, data: Partial<MaterialInput>) =>
    request<Material>(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateMaterialStock: (id: string, stock: number) =>
    request<Material>(`/materials/${id}/stock`, { method: 'PATCH', body: JSON.stringify({ stock }) }),
  deleteMaterial: (id: string) =>
    request<{ message: string }>(`/materials/${id}`, { method: 'DELETE' }),
};
