import { useEffect, useState, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, title, onClose, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass = size === 'sm' ? 'modal-sm' : size === 'lg' ? 'modal-lg' : 'modal-md';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${sizeClass}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="إغلاق">
            ×
          </button>
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

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'تأكيد',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel} size="sm">
      <p className="confirm-message">{message}</p>
      <div className="confirm-actions">
        <button className="btn btn-danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button className="btn btn-ghost" onClick={onCancel}>
          إلغاء
        </button>
      </div>
    </Modal>
  );
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastListeners: ((state: ToastState | null) => void)[] = [];

export function showToast(message: string, type: ToastState['type'] = 'info') {
  toastListeners.forEach((l) => l({ message, type }));
}

export function ToastContainer() {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    const listener = (state: ToastState | null) => {
      setToast(state);
      if (state) {
        setTimeout(() => setToast(null), 3500);
      }
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  if (!toast) return null;

  return (
    <div className={`toast toast-${toast.type}`}>
      <span>{toast.message}</span>
    </div>
  );
}

interface SpinnerProps {
  label?: string;
}

export function Spinner({ label }: SpinnerProps) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
}

interface StatusPillProps {
  status: string;
  labels: Record<string, string>;
}

export function StatusPill({ status, labels }: StatusPillProps) {
  return <span className={`pill pill-${status}`}>{labels[status] ?? status}</span>;
}

interface EmptyStateProps {
  title: string;
  message?: string;
  action?: ReactNode;
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
