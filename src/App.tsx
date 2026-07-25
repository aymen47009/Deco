// Build identifier: decoworkshops@1.0.2 — cache-busting marker for clean Vercel builds
import { useState } from "react";
import { FolderKanban, Users } from "lucide-react";
import { ProjectsView } from "./components/ProjectsView";
import { CustomersView } from "./components/CustomersView";

type Tab = "projects" | "customers";

export function App() {
  const [tab, setTab] = useState<Tab>("projects");

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-neutral-900">Deco Workshops</h1>
              <p className="text-xs text-neutral-500">Project management</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="mx-auto max-w-6xl px-4 pt-6">
        <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-1 shadow-sm">
          <TabButton active={tab === "projects"} onClick={() => setTab("projects")} icon={<FolderKanban className="h-4 w-4" />} label="Projects" />
          <TabButton active={tab === "customers"} onClick={() => setTab("customers")} icon={<Users className="h-4 w-4" />} label="Customers" />
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === "projects" ? <ProjectsView /> : <CustomersView />}
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-neutral-400">
        Deco Workshops &middot; Express + MongoDB Atlas
      </footer>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition ${
        active ? "bg-primary-600 text-white shadow-sm" : "text-neutral-600 hover:bg-neutral-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
