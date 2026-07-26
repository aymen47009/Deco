interface FloatingBarProps {
  onClick: () => void;
}

export function FloatingBar({ onClick }: FloatingBarProps) {
  return (
    <button className="floating-bar" onClick={onClick} aria-label="اطلب الآن">
      <span className="floating-bar-pulse" />
      <span className="floating-bar-text">اطلب الآن</span>
      <span className="floating-bar-arrow">←</span>
    </button>
  );
}
