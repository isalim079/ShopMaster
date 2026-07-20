import { parseDurationToMs } from '../../src/core/utils/duration';

describe('parseDurationToMs', () => {
  it('parses common JWT duration formats', () => {
    expect(parseDurationToMs('15m')).toBe(15 * 60 * 1000);
    expect(parseDurationToMs('7d')).toBe(7 * 24 * 60 * 60 * 1000);
    expect(parseDurationToMs('30s')).toBe(30_000);
  });

  it('throws on invalid format', () => {
    expect(() => parseDurationToMs('15minutes')).toThrow(/Invalid duration/);
  });
});
