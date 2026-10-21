import { useState } from 'react';

interface DashedDotRatingProps {
  total?: number;
  value?: number;
  onChange?: (value: number) => void;
}

export const DashedDotRating = ({ total = 5, value = 0, onChange }: DashedDotRatingProps) => {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => {
        const isFilled = i < value;
        return (
          <button
            key={i}
            onClick={() => onChange && onChange(i + 1 === value ? i : i + 1)}
            className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 transition-colors"
            style={{
              background: isFilled ? 'var(--dot-color)' : 'transparent',
              borderColor: isFilled ? 'var(--border)' : 'var(--border)',
              borderStyle: isFilled ? 'solid' : 'dashed',
            }}
            aria-label={`Rating ${i + 1}`}
          />
        );
      })}
    </div>
  );
};
