import { api } from "./client";
import type { Customer, Project } from "../types";

export const projectsApi = {
  list: (params?: { status?: string; customerId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.customerId) qs.set("customerId", params.customerId);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return api.get<Project[]>(`/projects${suffix}`);
  },
  get: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (body: Partial<Project>) => api.post<Project>("/projects", body),
  update: (id: string, body: Partial<Project>) => api.put<Project>(`/projects/${id}`, body),
  remove: (id: string) => api.del<{ success: boolean; id: string }>(`/projects/${id}`),
};

export const customersApi = {
  list: () => api.get<Customer[]>("/customers"),
  get: (id: string) => api.get<Customer>(`/customers/${id}`),
  create: (body: Partial<Customer>) => api.post<Customer>("/customers", body),
  update: (id: string, body: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, body),
  remove: (id: string) => api.del<{ success: boolean; id: string }>(`/customers/${id}`),
};
