export const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const MAX_SEARCH_LENGTH = 200;

export const sanitizeSearchInput = (input: unknown): string | null => {
  if (typeof input !== 'string' || !input.trim()) {return null;}
  const trimmed = input.trim().slice(0, MAX_SEARCH_LENGTH);
  return escapeRegex(trimmed);
};
