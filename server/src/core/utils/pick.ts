export const pick = <
  T extends Record<string, unknown>,
  K extends keyof T,
>(
  obj: T,
  keys: readonly K[],
): Partial<Pick<T, K>> => {
  return keys.reduce((acc, key) => {
    if (obj[key] !== undefined) {
      acc[key] = obj[key];
    }

    return acc;
  }, {} as Partial<Pick<T, K>>);
};