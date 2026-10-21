export interface DiceResult {
  value: number;
  isSuccess: boolean;
}

/**
 * Rolls a pool of d10 dice. Success = 9 or 10.
 * @param count - number of dice to roll
 * @returns array of results with success flags
 */
export const rollDicePool = (count: number): DiceResult[] => {
  if (count <= 0) return [];
  return Array.from({ length: count }, () => {
    const value = Math.floor(Math.random() * 10) + 1;
    return { value, isSuccess: value >= 9 };
  });
};

/**
 * Calculates the recommended dice pool from attributes and skill.
 * VtM 6E: pool = attribute (relevant) + skill level
 */
export const calculatePoolSize = (attribute: number, skillLevel: number): number => {
  return Math.max(1, attribute + skillLevel);
};
