import { useEffect, useState } from 'react';

interface FloatingButtonProps {
  onClick: () => void;
}

export function FloatingButton({ onClick }: FloatingButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handler);
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <button
      className={`floating-btn ${visible ? 'visible' : ''}`}
      onClick={onClick}
      aria-label="اطلب الآن"
    >
      <span className="floating-btn-pulse" />
      <span className="floating-btn-text">اطلب الآن</span>
    </button>
  );
}
