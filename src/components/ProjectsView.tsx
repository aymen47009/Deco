import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, FolderKanban } from "lucide-react";
import { projectsApi, customersApi } from "../api/resources";
import { ApiError } from "../api/client";
import type { Project, Customer, ProjectStatus } from "../types";
import { PROJECT_STATUSES } from "../types";
import { Spinner, ErrorState, EmptyState } from "./States";
import { ProjectForm } from "./ProjectForm";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  on_hold: "bg-neutral-100 text-neutral-600 border-neutral-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projData, custData] = await Promise.all([
        projectsApi.list(),
        customersApi.list(),
      ]);
      setProjects(projData);
      setCustomers(custData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try {
      await projectsApi.remove(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete project.");
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditing(null);
    load();
  };

  const customerName = (id?: string | null) =>
    id ? customers.find((c) => c.id === id)?.name ?? "Unknown" : "—";

  const filtered =
    filter === "all" ? projects : projects.filter((p) => p.status === filter);

  if (loading) return <Spinner label="Loading projects..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="animate-slide-up">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Projects</h2>
          <p className="text-sm text-neutral-500">{projects.length} total</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add project
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
        {PROJECT_STATUSES.map((s) => (
          <FilterChip
            key={s.value}
            label={s.label}
            active={filter === s.value}
            onClick={() => setFilter(s.value)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No projects here"
          description="Create a project to start tracking work for your customers."
          action={
            <button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95"
            >
              Add project
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{p.name}</p>
                    <p className="text-xs text-neutral-500">{customerName(p.customerId)}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => {
                      setEditing(p);
                      setShowForm(true);
                    }}
                    className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="rounded-md p-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {p.description && (
                <p className="mt-3 text-sm text-neutral-600 line-clamp-2">{p.description}</p>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_STYLES[p.status ?? "pending"] ?? STATUS_STYLES.pending
                  }`}
                >
                  {PROJECT_STATUSES.find((s) => s.value === p.status)?.label ?? "Pending"}
                </span>
                {typeof p.budget === "number" && p.budget > 0 && (
                  <span className="text-sm font-medium text-neutral-700">
                    ${p.budget.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ProjectForm
          project={editing}
          customers={customers}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? "border-primary-600 bg-primary-600 text-white"
          : "border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50"
      }`}
    >
      {label}
    </button>
  );
}

export type { ProjectStatus };
