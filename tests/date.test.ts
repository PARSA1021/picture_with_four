import { describe, expect, it } from 'vitest';
import { getFormattedDate } from '../src/utils/date.ts';

describe('Date Utility', () => {
  it('formats date as YYYY. MM. DD', () => {
    const fixedDate = new Date(2026, 8, 16); // month is 0-indexed: 8 = September
    expect(getFormattedDate(fixedDate)).toBe('2026. 09. 16');
  });

  it('pads single digit months and days with leading zeroes', () => {
    const fixedDate = new Date(2025, 0, 5); // January 5
    expect(getFormattedDate(fixedDate)).toBe('2025. 01. 05');
  });
});
