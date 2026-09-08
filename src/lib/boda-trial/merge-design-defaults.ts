export function mergeDesignDefaults<T extends Record<string, unknown>>(
  preset: T,
  stored: Partial<T>,
): T {
  return { ...preset, ...stored };
}
