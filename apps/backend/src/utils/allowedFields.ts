export function pickAllowedFields<T extends Record<string, unknown>>(
  body: Record<string, unknown>,
  allowedFields: readonly (keyof T)[]
): Partial<T> {
  const result: Partial<T> = {};
  for (const field of allowedFields) {
    if (body[field as string] !== undefined) {
      (result as any)[field] = body[field as string];
    }
  }
  return result;
}
