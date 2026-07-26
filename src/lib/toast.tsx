import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CircleCheck as CheckCircle2, Circle as XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.toast;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const remove = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-slide-up flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ring-brand-200"
          >
            {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            {t.type === "error" && <XCircle className="h-5 w-5 text-rose-600" />}
            {t.type === "info" && <Info className="h-5 w-5 text-blue-600" />}
            <span className="text-sm font-semibold text-brand-800">{t.message}</span>
            <button onClick={() => remove(t.id)} className="text-brand-400 hover:text-brand-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
