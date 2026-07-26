import { useRef, useState } from "react";
import { ImagePlus, Loader as Loader2, X } from "lucide-react";
import { api } from "../lib/api";

interface ImageUploaderProps {
  images: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  label?: string;
}

export function ImageUploader({ images, onChange, multiple = true, label = "رفع الصور" }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fileArr = Array.from(files);
      const results = multiple
        ? await api.uploadMultiple(fileArr)
        : [await api.upload(fileArr[0])];
      onChange([...images, ...results.map((r) => r.url)]);
    } catch {
      alert("تعذّر رفع الصورة");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="btn-outline w-full border-dashed py-6"
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
        ) : (
          <ImagePlus className="h-5 w-5 text-emerald-600" />
        )}
        <span>{uploading ? "جارٍ الرفع..." : label}</span>
      </button>
      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images.map((url, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-rose-600 text-white opacity-0 transition group-hover:opacity-100"
                onClick={() => onChange(images.filter((_, j) => j !== i))}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
