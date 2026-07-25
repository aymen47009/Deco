import type { JobStatus } from "../../types";
import { JOB_STATUS_LABELS } from "../../types";

const STYLES: Record<JobStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  assigned: "bg-blue-100 text-blue-700",
  in_progress: "bg-indigo-100 text-indigo-700",
  inspection: "bg-purple-100 text-purple-700",
  done: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function StatusPill({ status }: { status: JobStatus }) {
  return <span className={`chip ${STYLES[status]}`}>{JOB_STATUS_LABELS[status]}</span>;
}
