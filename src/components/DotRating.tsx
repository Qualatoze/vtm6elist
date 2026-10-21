interface DotRatingProps {
  total?: number;
  value: number;
  onChange?: (value: number) => void;
  shape?: 'square' | 'diamond'; // square = normal, diamond = rotated 45°
  size?: number; // px
  filledColor?: string; // CSS var or color for filled dots
  unfilledColor?: string; // CSS var or color for empty dots
  border?: string; // border color
  threshold?: number; // if value >= this, use accent color
  markStyle?: 'fill' | 'x'; // fill = solid, x = X cross mark
}

const haptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
};

export const DotRating = ({
  total = 5,
  value,
  onChange,
  shape = 'square',
  size = 16,
  filledColor = 'var(--dot-color)',
  unfilledColor = 'transparent',
  border = 'var(--border)',
  threshold,
  markStyle = 'fill'
}: DotRatingProps) => {
  const isDiamond = shape === 'diamond';
  const transform = isDiamond ? `rotate(45deg)` : 'none';
  const borderRadius = isDiamond ? '0' : '2px';

  return (
    <div style={{ display: 'flex', gap: isDiamond ? '3px' : '4px', alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => {
        const isFilled = i < value;
        const aboveThreshold = threshold !== undefined && value >= threshold;

        let bg: string;
        if (isFilled) {
          if (aboveThreshold) {
            bg = 'var(--accent)';
          } else {
            bg = filledColor;
          }
        } else {
          bg = unfilledColor;
        }

        return (
          <button
            key={i}
            onClick={() => {
              haptic();
              onChange && onChange(i + 1 === value ? i : i + 1);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: size,
              height: size,
              background: bg,
              border: `1px solid ${border}`,
              borderRadius,
              transform,
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
              transition: 'all 0.1s'
            }}
          >
            {markStyle === 'x' && isFilled ? (
              <span style={{ color: bg === 'var(--accent)' || bg === 'var(--dot-color)' ? '#fff' : 'var(--text)', fontSize: size * 0.7, fontWeight: 'bold', lineHeight: 1 }}>×</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};
