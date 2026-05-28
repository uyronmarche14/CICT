export const getProgramLabel = (
  program: string | { _id?: string; code?: string; name?: string }
): string => {
  if (typeof program === 'object' && program?.name) return program.name;
  if (typeof program === 'object' && program?.code) return program.code;
  return String(program || 'Unknown');
};

export const getYearLevelLabel = (
  yearLevel: string | { _id?: string; code?: string; label?: string; numericLevel?: number }
): string => {
  if (typeof yearLevel === 'object' && yearLevel?.label) return yearLevel.label;
  return String(yearLevel || 'Unknown');
};

export const getSectionLabel = (
  section: string | { _id?: string; name?: string; displayName?: string }
): string => {
  if (typeof section === 'object' && section?.displayName) return section.displayName;
  if (typeof section === 'object' && section?.name) return section.name;
  return String(section || 'Unknown');
};
