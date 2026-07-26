import { useEffect, useState, type ReactNode } from 'react';

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {message && <p>{message}</p>}
    </div>
  );
}

export function StatusPill({ status, labels }: { status: string; labels: Record<string, string> }) {
  return <span className={`pill pill-${status}`}>{labels[status] ?? status}</span>;
}

let toastListeners: ((state: { message: string; type: string } | null) => void)[] = [];
export function showToast(message: string, type: string = 'info') {
  toastListeners.forEach((l) => l({ message, type }));
}

export function ToastContainer() {
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  useEffect(() => {
    const listener = (state: { message: string; type: string } | null) => {
      setToast(state);
      if (state) setTimeout(() => setToast(null), 3500);
    };
    toastListeners.push(listener);
    return () => { toastListeners = toastListeners.filter((l) => l !== listener); };
  }, []);
  if (!toast) return null;
  return <div className={`toast toast-${toast.type}`}>{toast.message}</div>;
}

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}
export function Modal({ open, title, onClose, children, size = 'md' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content modal-${size}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}
export function ConfirmDialog({ open, title, message, confirmLabel = 'تأكيد', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel} size="sm">
      <p className="confirm-message">{message}</p>
      <div className="confirm-actions">
        <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        <button className="btn btn-ghost" onClick={onCancel}>إلغاء</button>
      </div>
    </Modal>
  );
}
