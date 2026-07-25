import type {
  AppData,
  Job,
  Worker,
  Material,
  JobBid,
  InspectionData,
  ExecutionData,
  PropertyType,
  JobComplexity,
  JobStatus,
  ReturnMethod,
} from "../types";

const STORAGE_KEY = "deco_workshops_data_v1";

const emptyData: AppData = {
  customers: [],
  workers: [],
  jobs: [],
  materials: [],
};

function seed(): AppData {
  const now = new Date().toISOString();
  return {
    customers: [
      { id: "c1", name: "أحمد محمد", phone: "0500111222", city: "الرياض", createdAt: now },
      { id: "c2", name: "سارة علي", phone: "0500333444", city: "جدة", createdAt: now },
    ],
    workers: [
      { id: "w1", name: "خالد الدهان", phone: "0555666777", city: "الرياض", specialty: "دهانات", rating: 4.8, jobsCompleted: 12, createdAt: now },
      { id: "w2", name: "عمر النجار", phone: "0555888999", city: "جدة", specialty: "نجارة", rating: 4.6, jobsCompleted: 8, createdAt: now },
    ],
    jobs: [
      {
        id: "j1",
        customerId: "c1",
        title: "دهان منزل",
        description: "دهان غرفتين",
        propertyType: "home",
        city: "الرياض",
        status: "pending",
        complexity: "simple",
        returnMethod: "pickup",
        bids: [],
        materials: [],
        createdAt: now,
        updatedAt: now,
      },
    ],
    materials: [
      { id: "m1", name: "دهان أبيض", category: "paint", unit: "لتر", stock: 40, minStock: 10, price: 25, createdAt: now },
      { id: "m2", name: "لوح خشب", category: "wood", unit: "قطعة", stock: 5, minStock: 15, price: 60, createdAt: now },
    ],
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    }
    return { ...emptyData, ...(JSON.parse(raw) as AppData) };
  } catch {
    return emptyData;
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData(): AppData {
  const s = seed();
  saveData(s);
  return s;
}

export function genId(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function newJob(p: {
  customerId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  city: string;
  complexity: JobComplexity;
  returnMethod: ReturnMethod;
}): Job {
  const now = new Date().toISOString();
  return {
    id: genId("j"),
    customerId: p.customerId,
    title: p.title,
    description: p.description,
    propertyType: p.propertyType,
    city: p.city,
    status: "pending",
    complexity: p.complexity,
    returnMethod: p.returnMethod,
    bids: [],
    materials: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function newWorker(p: { name: string; phone: string; city: string; specialty: string }): Worker {
  const now = new Date().toISOString();
  return {
    id: genId("w"),
    name: p.name,
    phone: p.phone,
    city: p.city,
    specialty: p.specialty,
    rating: 5,
    jobsCompleted: 0,
    createdAt: now,
  };
}

export function newMaterial(p: {
  name: string;
  category: Material["category"];
  unit: string;
  stock: number;
  minStock: number;
  price: number;
}): Material {
  const now = new Date().toISOString();
  return {
    id: genId("m"),
    ...p,
    createdAt: now,
  };
}

export function newBid(p: { workerId: string; amount: number; note?: string }): JobBid {
  return {
    workerId: p.workerId,
    amount: p.amount,
    note: p.note,
    createdAt: new Date().toISOString(),
  };
}

export function newInspection(p: { passed: boolean; notes: string; inspectorId: string }): InspectionData {
  return {
    passed: p.passed,
    notes: p.notes,
    inspectorId: p.inspectorId,
    date: new Date().toISOString(),
  };
}

export function newExecution(): ExecutionData {
  return {
    startDate: new Date().toISOString(),
    progress: 0,
  };
}

export function setStatus(j: Job, status: JobStatus): Job {
  return { ...j, status, updatedAt: new Date().toISOString() };
}
