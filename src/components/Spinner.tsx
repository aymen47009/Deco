import { Loader2 } from "lucide-react";

export function Spinner({ size = 24, className = "" }: { size?: number; className?: string }) {
  return <Loader2 className={`animate-spin text-brand-400 ${className}`} style={{ width: size, height: size }} />;
}

export function FullScreen({ label = "جارٍ التحميل..." }: { label?: string }) {
  return (
    <div className="grid place-items-center py-20 text-brand-400">
      <Spinner size={32} />
      <p className="mt-2 text-sm text-brand-500">{label}</p>
    </div>
  );
}
