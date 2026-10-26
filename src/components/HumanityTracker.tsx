import { useCharacterStore } from '../store';
import { useTranslation } from 'react-i18next';

const CELL = 15;

const CounterRow = ({ label, value, onChange, fillColor }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  fillColor: string;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
    <div style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--muted)', letterSpacing: '0.05em', fontFamily: "'Georgia', serif" }}>
      {label}
    </div>
    <div style={{ display: 'flex', gap: '3px' }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const pos = i + 1;
        const filled = pos <= value;
        return (
          <button
            key={pos}
            onClick={() => onChange(pos === value ? 0 : pos)}
            style={{
              width: `${CELL}px`, height: `${CELL}px`,
              background: filled ? fillColor : 'transparent',
              border: `1px solid ${filled ? fillColor : 'var(--border)'}`,
              transform: 'rotate(45deg)',
              cursor: 'pointer',
              padding: 0,
            }}
          />
        );
      })}
    </div>
    <div style={{ fontSize: '9px', color: 'var(--muted)', fontFamily: "'Georgia', serif" }}>
      {value}/5
    </div>
  </div>
);

export const HumanityTracker = () => {
  const character = useCharacterStore(s => s.getActive());
  const { updateHumanity } = useCharacterStore();
  const { t } = useTranslation();

  return (
    <div style={{ marginBottom: '15px' }}>
      <div style={{ fontWeight: 'bold', fontSize: '12px', letterSpacing: '0.1em', textAlign: 'center', fontFamily: "'Georgia', serif", marginBottom: '6px' }}>
        {t('ui.humanity_scale')}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        {/* ЛЕВО: Счётчик Зверя */}
        <CounterRow
          label={t('ui.beast_counter')}
          value={character.humanity.beast}
          onChange={(v) => updateHumanity('beast', v)}
          fillColor="var(--accent)"
        />

        {/* ЦЕНТР: шкала Человечности (7 квадратов) — уже работает */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--muted)', letterSpacing: '0.05em', fontFamily: "'Georgia', serif" }}>
              {t('ui.monstrous')}
            </span>
            <div style={{ display: 'flex', gap: '3px' }}>
              {Array.from({ length: 7 }).map((_, i) => {
                const pos = i + 1;
                const isFilled = pos === character.humanity.path;
                return (
                  <button
                    key={pos}
                    onClick={() => updateHumanity('path', pos)}
                    style={{
                      width: '16px', height: '16px',
                      background: isFilled ? 'var(--accent)' : 'transparent',
                      border: `2px solid ${isFilled ? 'var(--accent)' : 'var(--border)'}`,
                      transform: 'rotate(45deg)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    title={`${pos}/7`}
                  />
                );
              })}
            </div>
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--muted)', letterSpacing: '0.05em', fontFamily: "'Georgia', serif" }}>
              {t('ui.mortal')}
            </span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: "'Georgia', serif" }}>
            {character.humanity.path}/7
          </div>
        </div>

        {/* ПРАВО: Счётчик Натуры */}
        <CounterRow
          label={t('ui.nature_counter')}
          value={character.humanity.natureCounter}
          onChange={(v) => updateHumanity('natureCounter', v)}
          fillColor="var(--dot-color)"
        />
      </div>
    </div>
  );
};
