import type { Customer, Project } from "../types";

const BASE = "/api";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  projects: {
    list: () => req<Project[]>("/projects"),
    create: (p: Partial<Project>) => req<Project>("/projects", { method: "POST", body: JSON.stringify(p) }),
    update: (id: string, p: Partial<Project>) => req<Project>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(p) }),
    remove: (id: string) => req<{ ok: boolean }>(`/projects/${id}`, { method: "DELETE" }),
  },
  customers: {
    list: () => req<Customer[]>("/customers"),
    create: (c: Partial<Customer>) => req<Customer>("/customers", { method: "POST", body: JSON.stringify(c) }),
    update: (id: string, c: Partial<Customer>) => req<Customer>(`/customers/${id}`, { method: "PUT", body: JSON.stringify(c) }),
    remove: (id: string) => req<{ ok: boolean }>(`/customers/${id}`, { method: "DELETE" }),
  },
  upload: (file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    return fetch(`${BASE}/upload`, { method: "POST", body: fd }).then((r) => {
      if (!r.ok) throw new Error("Upload failed");
      return r.json() as Promise<{ url: string; public_id: string }>;
    });
  },
};
