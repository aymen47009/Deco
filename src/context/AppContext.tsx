import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  AppData,
  Job,
  Worker,
  Material,
  Customer,
  JobStatus,
  MaterialCategory,
  PropertyType,
  JobComplexity,
  ReturnMethod,
} from "../types";
import {
  loadData,
  saveData,
  resetData,
  newJob,
  newWorker,
  newMaterial,
  newBid,
  newInspection,
  newExecution,
  setStatus,
  genId,
} from "../lib/storage";

interface AppContextValue extends AppData {
  addCustomer: (p: { name: string; phone: string; city: string }) => Customer;
  addWorker: (p: { name: string; phone: string; city: string; specialty: string }) => void;
  addMaterial: (p: {
    name: string;
    category: MaterialCategory;
    unit: string;
    stock: number;
    minStock: number;
    price: number;
  }) => void;
  addJob: (p: {
    customerId: string;
    title: string;
    description: string;
    propertyType: PropertyType;
    city: string;
    complexity: JobComplexity;
    returnMethod: ReturnMethod;
  }) => void;
  updateJob: (id: string, patch: Partial<Job>) => void;
  setJobStatus: (id: string, status: JobStatus) => void;
  assignWorker: (jobId: string, workerId: string, price: number) => void;
  placeBid: (jobId: string, workerId: string, amount: number, note?: string) => void;
  addJobMaterial: (jobId: string, materialId: string, quantity: number) => void;
  completeInspection: (jobId: string, passed: boolean, notes: string, inspectorId: string) => void;
  updateProgress: (jobId: string, progress: number) => void;
  reset: () => void;
}

const Ctx = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const value = useMemo<AppContextValue>(() => {
    const update = (fn: (d: AppData) => AppData) => setData((prev) => fn(structuredClone(prev)));

    return {
      ...data,
      addCustomer: (p) => {
        const c: Customer = { id: genId("c"), ...p, createdAt: new Date().toISOString() };
        update((d) => {
          d.customers.push(c);
          return d;
        });
        return c;
      },
      addWorker: (p) =>
        update((d) => {
          d.workers.push(newWorker(p));
          return d;
        }),
      addMaterial: (p) =>
        update((d) => {
          d.materials.push(newMaterial(p));
          return d;
        }),
      addJob: (p) =>
        update((d) => {
          d.jobs.push(newJob(p));
          return d;
        }),
      updateJob: (id, patch) =>
        update((d) => {
          const i = d.jobs.findIndex((j) => j.id === id);
          if (i >= 0) d.jobs[i] = { ...d.jobs[i], ...patch, updatedAt: new Date().toISOString() };
          return d;
        }),
      setJobStatus: (id, status) =>
        update((d) => {
          const i = d.jobs.findIndex((j) => j.id === id);
          if (i >= 0) d.jobs[i] = setStatus(d.jobs[i], status);
          return d;
        }),
      assignWorker: (jobId, workerId, price) =>
        update((d) => {
          const j = d.jobs.find((j) => j.id === jobId);
          if (j) {
            j.assignedWorkerId = workerId;
            j.price = price;
            j.status = "assigned";
            j.execution = newExecution();
            j.updatedAt = new Date().toISOString();
          }
          return d;
        }),
      placeBid: (jobId, workerId, amount, note) =>
        update((d) => {
          const j = d.jobs.find((j) => j.id === jobId);
          if (j) j.bids.push(newBid({ workerId, amount, note }));
          return d;
        }),
      addJobMaterial: (jobId, materialId, quantity) =>
        update((d) => {
          const j = d.jobs.find((j) => j.id === jobId);
          if (j) {
            const existing = j.materials.find((m) => m.materialId === materialId);
            if (existing) existing.quantity += quantity;
            else j.materials.push({ materialId, quantity });
            const mat = d.materials.find((m) => m.id === materialId);
            if (mat) mat.stock = Math.max(0, mat.stock - quantity);
          }
          return d;
        }),
      completeInspection: (jobId, passed, notes, inspectorId) =>
        update((d) => {
          const j = d.jobs.find((j) => j.id === jobId);
          if (j) {
            j.inspection = newInspection({ passed, notes, inspectorId });
            j.status = passed ? "done" : "in_progress";
            j.updatedAt = new Date().toISOString();
          }
          return d;
        }),
      updateProgress: (jobId, progress) =>
        update((d) => {
          const j = d.jobs.find((j) => j.id === jobId);
          if (j && j.execution) {
            j.execution.progress = Math.min(100, Math.max(0, progress));
            if (j.execution.progress >= 100) {
              j.status = "inspection";
              j.execution.endDate = new Date().toISOString();
            }
          }
          return d;
        }),
      reset: () => setData(resetData()),
    };
  }, [data]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export type { Job, Worker, Material };
