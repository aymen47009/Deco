import { useState } from "react";
import type { Project } from "../types";
import { IMAGE_CATEGORY_LABELS } from "../types";
import { Camera, CircleCheck as CheckCircle2, DollarSign, User as UserIcon, MapPin, Ruler, Hash } from "lucide-react";
import { Lightbox } from "./Lightbox";
import {
  PROJECT_STATUS_LABELS, STATUS_STYLES,
} from "../types";
import { WORK_TYPE_LABELS, WORK_TYPE_ICONS } from "../types";

interface ProjectCardProps {
  project: Project;
  onEdit?: () => void;
  onValidate?: () => void;
  onCustomerPaid?: () => void;
  onWorkerPaid?: () => void;
  onAddImages?: (category: string) => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

export function ProjectCard({ project, onEdit, onValidate, onCustomerPaid, onWorkerPaid, onAddImages, onDelete, canEdit }: ProjectCardProps) {
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null);
  const [expanded, setExpanded] = useState(false);

  const requestImgs = project.images.filter((i) => i.category === "request").map((i) => i.url);
  const progressImgs = project.images.filter((i) => i.category === "progress").map((i) => i.url);
  const completionImgs = project.images.filter((i) => i.category === "completion").map((i) => i.url);
  const allImgs = project.images.map((i) => i.url);

  return (
    <>
      <div className="card overflow-hidden transition hover:shadow-md">
        {allImgs[0] && (
          <div className="relative h-44 overflow-hidden bg-brand-100">
            <img src={allImgs[0]} alt={project.title} className="h-full w-full object-cover" />
            <span className={`chip absolute right-3 top-3 ${STATUS_STYLES[project.status]}`}>
              {PROJECT_STATUS_LABELS[project.status]}
            </span>
          </div>
        )}
        {!allImgs[0] && (
          <div className="relative flex h-28 items-center justify-center bg-brand-50">
            <Camera className="h-8 w-8 text-brand-300" />
            <span className={`chip absolute right-3 top-3 ${STATUS_STYLES[project.status]}`}>
              {PROJECT_STATUS_LABELS[project.status]}
            </span>
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-brand-900">{project.title}</h3>
              <p className="mt-0.5 text-xs text-brand-400">
                <Hash className="inline h-3 w-3" /> {project._id.slice(-6).toUpperCase()}
              </p>
            </div>
            {project.workTypes && project.workTypes.length > 0 ? (
              project.workTypes.map((t) => (
                <span key={t} className="chip bg-gold-100 text-gold-700">
                  <span>{WORK_TYPE_ICONS[t]}</span> {WORK_TYPE_LABELS[t]}
                </span>
              ))
            ) : (
              <span className="chip bg-brand-100 text-brand-600">غير محدد</span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-brand-500">
            {project.customer && (
              <span className="chip bg-brand-50"><UserIcon className="h-3 w-3" /> {project.customer.name}</span>
            )}
            {project.city && (
              <span className="chip bg-brand-50"><MapPin className="h-3 w-3" /> {project.city}</span>
            )}
            <span className="chip bg-brand-50"><Ruler className="h-3 w-3" /> {project.area} م²</span>
            {project.worker && (
              <span className="chip bg-emerald-50 text-emerald-700"><UserIcon className="h-3 w-3" /> {project.worker.name}</span>
            )}
          </div>

          {project.description && (
            <p className="mt-2 line-clamp-2 text-xs text-brand-500">{project.description}</p>
          )}

          <div className="mt-3 rounded-xl bg-brand-50 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-brand-500">التكلفة الإجمالية</span>
              <span className="font-bold text-brand-900">{project.financials.totalCost} دج</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-brand-500">أتعاب العامل</span>
              <span className="font-bold text-emerald-700">{project.financials.workerFee} دج</span>
            </div>
            <div className="mt-2 flex gap-2">
              <span className={`chip ${project.financials.customerPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                <DollarSign className="h-3 w-3" /> {project.financials.customerPaid ? "العميل دفع" : "العميل لم يدفع"}
              </span>
              <span className={`chip ${project.financials.workerPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                <DollarSign className="h-3 w-3" /> {project.financials.workerPaid ? "العامل استلم" : "العامل لم يستلم"}
              </span>
            </div>
          </div>

          <ImageSection label={IMAGE_CATEGORY_LABELS.request} urls={requestImgs} onOpen={(idx) => setLightbox({ urls: requestImgs, index: idx })} />
          <ImageSection label={IMAGE_CATEGORY_LABELS.progress} urls={progressImgs} onOpen={(idx) => setLightbox({ urls: progressImgs, index: idx })} />
          <ImageSection label={IMAGE_CATEGORY_LABELS.completion} urls={completionImgs} onOpen={(idx) => setLightbox({ urls: completionImgs, index: idx })} />

          <button className="mt-2 text-xs font-semibold text-emerald-600 hover:underline" onClick={() => setExpanded((e) => !e)}>
            {expanded ? "إخفاء التفاصيل" : "عرض كل التفاصيل"}
          </button>

          {expanded && (
            <div className="mt-2 space-y-2 border-t border-brand-100 pt-2 text-xs text-brand-500">
              {project.validatedAt && <p>تاريخ المصادقة: {new Date(project.validatedAt).toLocaleDateString("ar")}</p>}
              {project.completedAt && <p>تاريخ الإكمال: {new Date(project.completedAt).toLocaleDateString("ar")}</p>}
              {project.createdAt && <p>تاريخ الإنشاء: {new Date(project.createdAt).toLocaleDateString("ar")}</p>}
            </div>
          )}

          {canEdit && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-100 pt-3">
              {onEdit && <button className="btn-outline text-xs" onClick={onEdit}>تعديل / تعيين</button>}
              {onAddImages && (
                <>
                  <button className="btn-outline text-xs" onClick={() => onAddImages("progress")}>+ صور تقدم</button>
                  <button className="btn-outline text-xs" onClick={() => onAddImages("completion")}>+ صور إنجاز</button>
                </>
              )}
              {project.status === "in_progress" && onValidate && (
                <button className="btn-emerald text-xs" onClick={onValidate}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> مصادقة
                </button>
              )}
              {project.status === "validated" && onCustomerPaid && !project.financials.customerPaid && (
                <button className="btn-gold text-xs" onClick={onCustomerPaid}>
                  <DollarSign className="h-3.5 w-3.5" /> تأكيد دفع العميل
                </button>
              )}
              {project.financials.workerFee > 0 && !project.financials.workerPaid && onWorkerPaid && (
                <button className="btn-outline text-xs text-emerald-700" onClick={onWorkerPaid}>
                  <DollarSign className="h-3.5 w-3.5" /> تأكيد دفع العامل
                </button>
              )}
              {onDelete && (
                <button className="btn-outline text-xs text-rose-600" onClick={onDelete}>
                  حذف
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {lightbox && (
        <Lightbox
          images={lightbox.urls}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}

function ImageSection({ label, urls, onOpen }: { label: string; urls: string[]; onOpen: (idx: number) => void }) {
  if (urls.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="mb-1.5 text-xs font-semibold text-brand-600">{label} ({urls.length})</p>
      <div className="grid grid-cols-4 gap-1.5">
        {urls.map((url, i) => (
          <button key={i} onClick={() => onOpen(i)} className="aspect-square overflow-hidden rounded-lg ring-1 ring-brand-100 transition hover:ring-emerald-400">
            <img src={url} alt="" className="h-full w-full object-cover transition hover:scale-105" />
          </button>
        ))}
      </div>
    </div>
  );
}
