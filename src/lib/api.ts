import type { Customer, Project, User } from "../types";

const BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { headers, ...init });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(msg.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UploadResult {
  url: string;
  public_id: string;
}

export const api = {
  auth: {
    login: (phone: string, password: string) =>
      req<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify({ phone, password }) }),
    me: () => req<User>("/auth/me"),
  },
  projects: {
    list: (status?: string) => req<Project[]>(`/projects${status ? `?status=${status}` : ""}`),
    get: (id: string) => req<Project>(`/projects/${id}`),
    publicRequest: (data: Record<string, unknown>) =>
      req<Project>("/projects/public-request", { method: "POST", body: JSON.stringify(data) }),
    assign: (id: string, data: { workerId?: string; totalCost?: number; workerFee?: number }) =>
      req<Project>(`/projects/${id}/assign`, { method: "PATCH", body: JSON.stringify(data) }),
    validate: (id: string) => req<Project>(`/projects/${id}/validate`, { method: "PATCH" }),
    customerPaid: (id: string) => req<Project>(`/projects/${id}/customer-paid`, { method: "PATCH" }),
    workerPaid: (id: string) => req<Project>(`/projects/${id}/worker-paid`, { method: "PATCH" }),
    addImages: (id: string, images: string[], category: string) =>
      req<Project>(`/projects/${id}/add-images`, {
        method: "PATCH",
        body: JSON.stringify({ images, category }),
      }),
    remove: (id: string) => req<{ ok: boolean }>(`/projects/${id}`, { method: "DELETE" }),
  },
  customers: {
    list: () => req<Customer[]>("/customers"),
    create: (c: Partial<Customer>) => req<Customer>("/customers", { method: "POST", body: JSON.stringify(c) }),
    remove: (id: string) => req<{ ok: boolean }>(`/customers/${id}`, { method: "DELETE" }),
  },
  workers: {
    list: () => req<User[]>("/workers"),
    create: (w: { name: string; phone: string; password: string }) =>
      req<User>("/workers", { method: "POST", body: JSON.stringify(w) }),
    remove: (id: string) => req<{ ok: boolean }>(`/workers/${id}`, { method: "DELETE" }),
    payDues: (id: string) => req<User>(`/workers/${id}/pay-dues`, { method: "PATCH" }),
  },
  upload: (file: File): Promise<UploadResult> => {
    const fd = new FormData();
    fd.append("image", file);
    return fetch(`${BASE}/upload`, { method: "POST", body: fd }).then((r) => {
      if (!r.ok) throw new Error("Upload failed");
      return r.json() as Promise<UploadResult>;
    });
  },
  uploadMultiple: (files: File[]): Promise<UploadResult[]> => {
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    return fetch(`${BASE}/upload/multiple`, { method: "POST", body: fd }).then((r) => {
      if (!r.ok) throw new Error("Upload failed");
      return r.json() as Promise<UploadResult[]>;
    });
  },
};
