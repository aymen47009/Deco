import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Building2, Mail, Phone, MapPin } from "lucide-react";
import { customersApi } from "../api/resources";
import { ApiError } from "../api/client";
import type { Customer } from "../types";
import { Spinner, ErrorState, EmptyState } from "./States";
import { CustomerForm } from "./CustomerForm";

export function CustomersView() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customersApi.list();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer? This cannot be undone.")) return;
    try {
      await customersApi.remove(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete customer.");
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditing(null);
    load();
  };

  if (loading) return <Spinner label="Loading customers..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (customers.length === 0)
    return (
      <EmptyState
        title="No customers yet"
        description="Add your first customer to start tracking projects."
        action={
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95"
          >
            Add customer
          </button>
        }
      />
    );

  return (
    <div className="animate-slide-up">
    <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Customers</h2>
          <p className="text-sm text-neutral-500">{customers.length} total</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add customer
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {customers.map((c) => (
          <div
            key={c.id}
            className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600 font-semibold">
                  {c.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">{c.name}</p>
                  {c.company && (
                    <p className="flex items-center gap-1 text-xs text-neutral-500">
                      <Building2 className="h-3 w-3" /> {c.company}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button
                  onClick={() => {
                    setEditing(c);
                    setShowForm(true);
                  }}
                  className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="rounded-md p-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 space-y-1.5 text-sm text-neutral-600">
              {c.email && (
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-neutral-400" /> {c.email}
                </p>
              )}
              {c.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-neutral-400" /> {c.phone}
                </p>
              )}
              {c.address && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400" /> {c.address}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <CustomerForm
          customer={editing}
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
