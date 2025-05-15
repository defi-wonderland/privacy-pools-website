import { describe, it, expect } from '@jest/globals';
import { getUsdBalance, formatDataNumber, formatSmallNumber } from '~/utils/misc';

describe('miscUtils', () => {
  describe('formatDataNumber', () => {
    it('should return "$0" for 0 input with currency true', () => {
      expect(formatDataNumber('0', 18, 2, true)).toBe('$0');
    });

    it('should return "0" for 0 input with currency false', () => {
      expect(formatDataNumber('0', 18, 2, false)).toBe('0');
    });

    it('should return "$0" for NaN input with currency true', () => {
      expect(formatDataNumber('not-a-number', 18, 2, true)).toBe('$0');
    });

    it('should format a standard number string with default decimals', () => {
      expect(formatDataNumber('1234500000000000000', 18, 3)).toBe('1.235');
    });

    it('should format as currency', () => {
      expect(formatDataNumber('1234500000000000000', 18, 2, true)).toBe('$1.23');
    });

    it('should handle compact notation for large numbers', () => {
      expect(formatDataNumber('1230000000000000000000000', 18, 2, false, true)).toBe('1.23M');
    });

    it('should format as currency with compact notation', () => {
      expect(formatDataNumber('1230000000000000000000000', 18, 2, true, true)).toBe('$1.23M');
    });

    it('should display very small numbers as <0.001 by default (no smallDecimal flag)', () => {
      expect(formatDataNumber('100000000000000', 18, 3)).toBe('<0.001');
    });

    it('should display very small numbers as currency <$0.001 by default (no smallDecimal flag)', () => {
      expect(formatDataNumber('100000000000000', 18, 3, true)).toBe('$<0.001');
    });

    it('should use formatSmallNumber logic for smallDecimal true and value < 0.001', () => {
      expect(formatDataNumber('123450000000000', 18, 3, false, false, true, 3)).toBe('0.0001235');
    });

    it('should use formatSmallNumber logic for smallDecimal true and value < 0.001, with currency', () => {
      expect(formatDataNumber('123450000000000', 18, 3, true, false, true, 3)).toBe('$0.0001235');
    });

    it('should handle numbers >= 1e12 with exponential notation', () => {
      expect(formatDataNumber('1000000000000000000000000000000', 18, 2)).toBe('1e+12');
    });

    it('should handle input as number (decimals=0 means no further unit conversion)', () => {
      expect(formatDataNumber(1234.567, 0, 2)).toBe('1,234.57');
    });

    it('should handle input as number with unit conversion (decimals > 0)', () => {
      expect(formatDataNumber(12345, 2, 1)).toBe('123.5');
    });

    it('should handle input as bigint', () => {
      expect(formatDataNumber(BigInt('1234500000000000000'), 18, 3)).toBe('1.235');
    });

    it('should use specified formatDecimal for non-small numbers', () => {
      expect(formatDataNumber('1234560000000000000', 18, 4)).toBe('1.2346');
    });

    it('should round up with Math.ceil for smallDecimal=true when res >= 0.001 and < 1', () => {
      expect(formatDataNumber('1234000000000000', 18, 3, false, false, true)).toBe('0.001234');
    });

    it('should handle decimals = 0 correctly (input is already in final unit)', () => {
      expect(formatDataNumber('12345', 0, 2, false)).toBe('12,345');
      expect(formatDataNumber('123.45', 0, 2, false)).toBe('123.45');
      expect(formatDataNumber(50, 0, 0, true)).toBe('$50');
    });
  });

  describe('getUsdBalance', () => {
    it('should return "0" if price is null', () => {
      expect(getUsdBalance(null, '100', 18)).toBe('0');
    });

    it('should return "0" if balance is effectively zero or not provided', () => {
      expect(getUsdBalance(10, '', 18)).toBe('0');
      expect(getUsdBalance(10, null as unknown as string, 18)).toBe('0');
      expect(getUsdBalance(10, '0', 18)).toBe('$0');
    });

    it('should return "0" if decimals is 0 (as per original logic: !decimals)', () => {
      expect(getUsdBalance(10, '100', 0)).toBe('0');
    });

    it('should calculate and format USD balance correctly', () => {
      const price = 2.5;
      const balance = '150';
      const decimals = 18;

      expect(getUsdBalance(price, balance, decimals)).toBe('$375.00');
    });

    it('should handle a case with different decimals and formatting', () => {
      const price = 0.005;
      const balance = '250000';
      const decimals = 6;

      expect(getUsdBalance(price, balance, decimals)).toBe('$1.25K');
    });

    it('should use compact notation if value is large enough', () => {
      const price = 2000;
      const balance = '1000';
      const decimals = 2;

      expect(getUsdBalance(price, balance, decimals)).toBe('$2.00M');
    });

    it('should handle zero price correctly', () => {
      expect(getUsdBalance(0, '1000', 18)).toBe('0');
    });
  });

  describe('formatSmallNumber', () => {
    it('should return "0" if value is 0', () => {
      expect(formatSmallNumber(0)).toBe('0');
    });

    it('should format a small number with default significant digits (3)', () => {
      expect(formatSmallNumber(0.00012345)).toBe('0.0001235');
    });

    it('should format with specified significant digits', () => {
      expect(formatSmallNumber(0.00012345, false, 4)).toBe('0.00012345');
      expect(formatSmallNumber(0.00012345, false, 2)).toBe('0.000124');
    });

    it('should add currency symbol if currency is true', () => {
      expect(formatSmallNumber(0.00012345, true, 3)).toBe('$0.0001235');
    });

    it('should trim trailing zeros after decimal point', () => {
      expect(formatSmallNumber(0.01, false, 3)).toBe('0.01');
      expect(formatSmallNumber(0.123, false, 3)).toBe('0.123');
    });

    it('should handle numbers that become integers after rounding to significant digits', () => {
      expect(formatSmallNumber(0.999, false, 1)).toBe('1');
      expect(formatSmallNumber(0.099, false, 1)).toBe('0.099');
      expect(formatSmallNumber(0.0099, false, 1)).toBe('0.01');
    });

    it('should format negative small numbers correctly', () => {
      expect(formatSmallNumber(-0.00012345, false, 3)).toBe('-0.0001234');
      expect(formatSmallNumber(-0.00012345, true, 2)).toBe('$-0.000123');
    });
  });
});
