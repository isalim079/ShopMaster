const UNIT_TO_MS: Record<string, number> = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
}

/**
 * Parse duration strings used by JWT env vars (e.g. `15m`, `7d`) into milliseconds.
 */
export const parseDurationToMs = (value: string): number => {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(value.trim())

  if (!match?.[1] || !match[2]) {
    throw new Error(
      `Invalid duration "${value}". Expected format like 15m, 7d, 30s.`,
    )
  }

  const amount = Number(match[1])
  const multiplier = UNIT_TO_MS[match[2]]

  if (multiplier === undefined) {
    throw new Error(
      `Invalid duration "${value}". Expected format like 15m, 7d, 30s.`,
    )
  }

  return amount * multiplier
}

export const getExpiryDateFromDuration = (value: string): Date => {
  return new Date(Date.now() + parseDurationToMs(value))
}
