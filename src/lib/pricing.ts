import type { Job, Material, MaterialUsage } from "../types";

const COMPLEXITY_MULTIPLIER: Record<Job["complexity"], number> = {
  simple: 1,
  medium: 1.5,
  complex: 2.2,
};

const PROPERTY_BASE: Record<Job["propertyType"], number> = {
  home: 500,
  workshop: 800,
  shop: 650,
};

export function estimateJobPrice(job: Job, materials: Material[]): number {
  const base = PROPERTY_BASE[job.propertyType] * COMPLEXITY_MULTIPLIER[job.complexity];
  const mats = materialsCost(job.materials, materials);
  return Math.round(base + mats);
}

export function materialsCost(usage: MaterialUsage[], materials: Material[]): number {
  const byId = new Map(materials.map((m) => [m.id, m]));
  return usage.reduce((sum, u) => {
    const m = byId.get(u.materialId);
    return sum + (m ? m.price * u.quantity : 0);
  }, 0);
}

export function formatSAR(value: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
}
