import { useEffect, useState } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

interface LightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
}

export function Lightbox({ images, index, onClose }: LightboxProps) {
  const [i, setI] = useState(index);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setI((p) => (p + 1) % images.length);
      if (e.key === "ArrowRight") setI((p) => (p - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  const prev = () => setI((p) => (p - 1 + images.length) % images.length);
  const next = () => setI((p) => (p + 1) % images.length);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/90 p-4 animate-fade-in" onClick={onClose}>
      <button className="absolute top-4 left-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" onClick={onClose}>
        <X className="h-6 w-6" />
      </button>
      <button
        className="absolute right-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        onClick={(e) => { e.stopPropagation(); prev(); }}
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      <img
        src={images[i]}
        alt=""
        className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        className="absolute left-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        onClick={(e) => { e.stopPropagation(); next(); }}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
        {i + 1} / {images.length}
      </span>
    </div>
  );
}
