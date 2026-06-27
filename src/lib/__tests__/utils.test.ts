import { describe, it, expect } from 'vitest';
import { formatVXLM, formatPercent, formatCompactNumber } from '../utils';

describe('formatVXLM', () => {
  it('formats values below 1 000 with two decimal places', () => {
    expect(formatVXLM(0)).toBe('0.00 vXLM');
    expect(formatVXLM(1)).toBe('1.00 vXLM');
    expect(formatVXLM(999.5)).toBe('999.50 vXLM');
    expect(formatVXLM(123.456)).toBe('123.46 vXLM');
  });

  it('formats values >= 1 000 with K suffix', () => {
    expect(formatVXLM(1_000)).toBe('1.00K vXLM');
    expect(formatVXLM(1_500)).toBe('1.50K vXLM');
    expect(formatVXLM(999_999)).toBe('1000.00K vXLM');
  });

  it('formats values >= 1 000 000 with M suffix', () => {
    expect(formatVXLM(1_000_000)).toBe('1.00M vXLM');
    expect(formatVXLM(2_500_000)).toBe('2.50M vXLM');
  });

  it('respects custom decimals argument', () => {
    expect(formatVXLM(1_234, 0)).toBe('1K vXLM');
    expect(formatVXLM(1_234.567, 3)).toBe('1.235K vXLM');
  });

  it('handles negative values', () => {
    expect(formatVXLM(-500)).toBe('-500.00 vXLM');
    expect(formatVXLM(-1_500)).toBe('-1.50K vXLM');
  });

  it('handles non-finite values gracefully', () => {
    expect(formatVXLM(NaN)).toBe('0.00 vXLM');
    expect(formatVXLM(Infinity)).toBe('0.00 vXLM');
    expect(formatVXLM(-Infinity)).toBe('0.00 vXLM');
  });
});

describe('formatPercent', () => {
  it('converts a 0-1 ratio to a percentage string', () => {
    expect(formatPercent(0)).toBe('0.00%');
    expect(formatPercent(1)).toBe('100.00%');
    expect(formatPercent(0.5)).toBe('50.00%');
    expect(formatPercent(0.4567)).toBe('45.67%');
  });

  it('respects custom decimals', () => {
    expect(formatPercent(0.3333, 0)).toBe('33%');
    expect(formatPercent(0.3333, 1)).toBe('33.3%');
  });

  it('handles non-finite values gracefully', () => {
    expect(formatPercent(NaN)).toBe('0.00%');
    expect(formatPercent(Infinity)).toBe('0.00%');
  });
});

describe('formatCompactNumber', () => {
  it('formats values below 1 000 as plain numbers', () => {
    expect(formatCompactNumber(0)).toBe('0.00');
    expect(formatCompactNumber(42)).toBe('42.00');
    expect(formatCompactNumber(999)).toBe('999.00');
  });

  it('formats values >= 1 000 with K suffix', () => {
    expect(formatCompactNumber(1_000)).toBe('1.00K');
    expect(formatCompactNumber(2_500)).toBe('2.50K');
  });

  it('formats values >= 1 000 000 with M suffix', () => {
    expect(formatCompactNumber(1_000_000)).toBe('1.00M');
    expect(formatCompactNumber(3_750_000)).toBe('3.75M');
  });

  it('handles negative values', () => {
    expect(formatCompactNumber(-1_500)).toBe('-1.50K');
  });

  it('handles non-finite values gracefully', () => {
    expect(formatCompactNumber(NaN)).toBe('0');
    expect(formatCompactNumber(Infinity)).toBe('0');
  });
});
