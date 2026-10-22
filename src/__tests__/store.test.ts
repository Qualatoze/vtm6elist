import { describe, it, expect, vi } from 'vitest';
import { createEmptyCharacter } from '../store';
import { SKILLS_LIST } from '../types';

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
    expect(char.skills[SKILLS_LIST[0].id]).toBeDefined();
    expect(char.skills[SKILLS_LIST[0].id].dots).toBe(0);
    expect(char.skills[SKILLS_LIST[1].id].specifications[0]).toBe('');
  });
});
