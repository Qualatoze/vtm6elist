import { useCharacterStore } from '../store';

export const HumanityTracker = () => {
  const character = useCharacterStore(s => s.getActive());
  const { updateHumanity } = useCharacterStore();

  return (
    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
      {/* Title */}
      <div style={{ fontWeight: 'bold', fontSize: '12px', letterSpacing: '0.1em', fontFamily: "'Georgia', serif", marginBottom: '6px' }}>
        ШКАЛА ЧЕЛОВЕЧНОСТИ
      </div>

      {/* Scale: ЧУДОВИЩНАЯ [7 squares] ЧЕЛОВЕЧЕСКАЯ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--muted)', letterSpacing: '0.05em', fontFamily: "'Georgia', serif" }}>
          ЧУДОВИЩНАЯ
        </span>

        {/* 7 squares — path value determines which is filled */}
        <div style={{ display: 'flex', gap: '3px' }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const pos = i + 1; // 1-7
            const isFilled = pos === character.humanity.path;
            return (
              <button
                key={i}
                onClick={() => updateHumanity('path', pos)}
                style={{
                  width: '16px',
                  height: '16px',
                  background: isFilled ? 'var(--accent)' : 'transparent',
                  border: `2px solid ${isFilled ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '0',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                {isFilled ? (
                  <span style={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', lineHeight: 1 }}>■</span>
                ) : null}
              </button>
            );
          })}
        </div>

        <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--muted)', letterSpacing: '0.05em', fontFamily: "'Georgia', serif" }}>
          ЧЕЛОВЕЧЕСКАЯ
        </span>
      </div>

      {/* Path number */}
      <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px', fontFamily: "'Georgia', serif" }}>
        Позиция: {character.humanity.path}/7
      </div>
    </div>
  );
};
