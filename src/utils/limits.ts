// Лимиты по правилам пользователя (house-rule, не из PDF):
// - Поколение 8+ → максимум характеристики 5
// - Поколение 7 → 6, 6 → 7, 5 → 8, 4 → 9, 3 → 10
// - Неонат → максимум навыка 3, остальные виды — 5
// unlock=true полностью снимает лимиты (Unlock в шапке).

export const getAttributeCap = (generation: string, unlock: boolean): number => {
  if (unlock) return 10;
  const gen = parseInt(generation, 10);
  if (isNaN(gen) || gen >= 8) return 5;
  if (gen <= 3) return 10;
  return 10 - (gen - 3); // gen 7→6, 6→7, 5→8, 4→9
};

export const getSkillCap = (type: string, unlock: boolean): number => {
  if (unlock) return 5;
  return type === 'vampire_neonate' ? 3 : 5;
};
