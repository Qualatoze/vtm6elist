import { describe, it, expect, vi } from 'vitest';
import { createEmptyCharacter } from '../store';
import { CLAN_DATA } from '../types';

describe('createEmptyCharacter', () => {
  it('creates a character with default values', () => {
    const char = createEmptyCharacter();
    expect(char.id).toBeDefined();
    expect(char.meta.name).toBe('');
    expect(char.attributes.physical.strength).toBe(1);
    expect(char.vitae.current).toBe(5);
    expect(char.vitae.max).toBe(11);
    expect(char.willpower.current).toBe(5);
    expect(char.willpower.max).toBe(7);
    expect(char.bloodSurge).toBe(0);
    expect(char.humanity.path).toBe(4);
  });

  it('has all skills initialized with 0 dots', () => {
    const char = createEmptyCharacter();
    expect(char.skills['Бой']).toBeDefined();
    expect(char.skills['Бой'].dots).toBe(0);
    expect(char.skills['Знания'].specifications[0]).toBe('');
  });
});
