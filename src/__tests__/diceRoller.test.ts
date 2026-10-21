import { describe, it, expect, vi } from 'vitest';
import { rollDicePool, calculatePoolSize } from '../utils/diceRoller';

describe('rollDicePool', () => {
  it('returns empty array for count <= 0', () => {
    expect(rollDicePool(0)).toEqual([]);
    expect(rollDicePool(-1)).toEqual([]);
  });

  it('returns correct number of dice results', () => {
    const results = rollDicePool(5);
    expect(results.length).toBe(5);
  });

  it('each die value is between 1 and 10', () => {
    const results = rollDicePool(20);
    for (const r of results) {
      expect(r.value).toBeGreaterThanOrEqual(1);
      expect(r.value).toBeLessThanOrEqual(10);
    }
  });

  it('marks values >= 9 as success', () => {
    const originalRandom = Math.random;
    Math.random = () => 0.85;

    const results = rollDicePool(3);

    for (const r of results) {
      expect(r.value).toBe(9);
      expect(r.isSuccess).toBe(true);
    }

    Math.random = originalRandom;
  });

  it('marks values < 9 as failure', () => {
    const originalRandom = Math.random;
    Math.random = () => 0.15;

    const results = rollDicePool(3);

    for (const r of results) {
      expect(r.value).toBe(2);
      expect(r.isSuccess).toBe(false);
    }

    Math.random = originalRandom;
  });

  it('value 10 is success', () => {
    const originalRandom = Math.random;
    Math.random = () => 0.95;

    const results = rollDicePool(1);

    expect(results[0].value).toBe(10);
    expect(results[0].isSuccess).toBe(true);

    Math.random = originalRandom;
  });

  it('value 8 is failure', () => {
    const originalRandom = Math.random;
    Math.random = () => 0.75;

    const results = rollDicePool(1);

    expect(results[0].value).toBe(8);
    expect(results[0].isSuccess).toBe(false);

    Math.random = originalRandom;
  });
});

describe('calculatePoolSize', () => {
  it('returns attribute + skill level', () => {
    expect(calculatePoolSize(3, 2)).toBe(5);
    expect(calculatePoolSize(1, 0)).toBe(1);
    expect(calculatePoolSize(5, 5)).toBe(10);
  });

  it('returns at least 1', () => {
    expect(calculatePoolSize(0, 0)).toBe(1);
    expect(calculatePoolSize(-1, -1)).toBe(1);
  });
});
