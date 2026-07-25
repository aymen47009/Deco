import { Loader2 } from "lucide-react";

export function Spinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-500 animate-fade-in">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" aria-hidden />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center animate-fade-in">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
        <span className="text-2xl" aria-hidden>!</span>
      </div>
      <div>
        <p className="font-semibold text-neutral-800">Something went wrong</p>
        <p className="mt-1 text-sm text-neutral-500 max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 active:scale-95">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center animate-fade-in">
      <p className="text-lg font-semibold text-neutral-700">{title}</p>
      {description && <p className="text-sm text-neutral-500 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
