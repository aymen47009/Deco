import { useState } from "react";
import { X } from "lucide-react";
import { customersApi } from "../api/resources";
import { ApiError } from "../api/client";
import type { Customer } from "../types";

export function CustomerForm({ customer, onClose, onSaved }: { customer: Customer | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: customer?.name ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    company: customer?.company ?? "",
    address: customer?.address ?? "",
    notes: customer?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (customer) await customersApi.update(customer.id, form);
      else await customersApi.create(form);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save customer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-slide-up">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">{customer ? "Edit customer" : "New customer"}</h3>
          <button onClick={onClose} className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name" required><input required value={form.name} onChange={(e) => set("name", e.target.value)} className="input" /></Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Email"><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="input" /></Field>
            <Field label="Phone"><input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="input" /></Field>
          </div>
          <Field label="Company"><input value={form.company} onChange={(e) => set("company", e.target.value)} className="input" /></Field>
          <Field label="Address"><input value={form.address} onChange={(e) => set("address", e.target.value)} className="input" /></Field>
          <Field label="Notes"><textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} className="input" /></Field>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">{label}{required && <span className="text-red-500"> *</span>}</span>
      {children}
    </label>
  );
}
