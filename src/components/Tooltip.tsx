import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  text: string;
  showTips?: boolean;
  position?: 'top' | 'bottom';
  iconSize?: number;
}

export const Tooltip = ({ text, showTips, position = 'top', iconSize = 14 }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!showTips) return null;

  const isTop = position === 'top';

  return (
    <div
      ref={tooltipRef}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', zIndex: isVisible ? 100 : 'auto' }}
    >
      <button
        onClick={(e) => { e.preventDefault(); setIsVisible(!isVisible); }}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          color: 'var(--muted)',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.7
        }}
        title="Подсказка"
      >
        <HelpCircle size={iconSize} />
      </button>

      {isVisible && (
        <div
          style={{
            position: 'absolute',
            ...(isTop ? { bottom: '100%', marginBottom: '8px' } : { top: '100%', marginTop: '8px' }),
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'max-content',
            maxWidth: '320px',
            background: 'var(--panel)',
            border: '1px solid var(--accent)',
            borderRadius: '6px',
            padding: '10px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            color: 'var(--text)',
            fontSize: '11px',
            lineHeight: '1.4',
            fontFamily: "'Inter', sans-serif",
            zIndex: 9999,
            pointerEvents: 'none',
            whiteSpace: 'normal',
            textAlign: 'left'
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};
