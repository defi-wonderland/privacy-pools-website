import { describe, it, expect } from '@jest/globals';
import { parseEther } from 'viem';
import { calculateInitialDeposit, calculateAspFee } from '~/utils';

describe('calculateDeposits', () => {
  describe('calculateInitialDeposit', () => {
    it('should return inputAmount if feeBps is 0', () => {
      const inputAmount = parseEther('1');
      const feeBps = 0n;
      expect(calculateInitialDeposit(inputAmount, feeBps)).toBe(inputAmount);
    });

    it('should calculate initial deposit correctly for a given fee', () => {
      const inputAmount = parseEther('1');
      const feeBps = 100n;
      const expectedInitialDeposit = parseEther('1.010101010101010101');
      expect(calculateInitialDeposit(inputAmount, feeBps)).toBe(expectedInitialDeposit);
    });

    it('should return 0 if inputAmount is 0', () => {
      const inputAmount = 0n;
      const feeBps = 100n;
      expect(calculateInitialDeposit(inputAmount, feeBps)).toBe(0n);
    });

    it('should handle feeBps equal to 10000 (100% fee) gracefully', () => {
      const inputAmount = parseEther('1');
      const feeBps = 10000n;
      expect(() => calculateInitialDeposit(inputAmount, feeBps)).toThrow(RangeError);
    });
  });

  describe('calculateAspFee', () => {
    it('should return 0 if feeBps is 0', () => {
      const amount = parseEther('10');
      const feeBps = 0n;
      expect(calculateAspFee(amount, feeBps)).toBe(0n);
    });

    it('should return 0 if amount is 0', () => {
      const amount = 0n;
      const feeBps = 100n;
      expect(calculateAspFee(amount, feeBps)).toBe(0n);
    });

    it('should calculate fee correctly for a given amount and feeBps', () => {
      const amount = parseEther('2');
      const feeBps = 50n;
      const expectedFee = parseEther('0.01');
      expect(calculateAspFee(amount, feeBps)).toBe(expectedFee);
    });

    it('should handle rounding/truncation correctly with bigint division', () => {
      const amount = parseEther('1');
      const feeBps = 1n;
      const expectedFee = parseEther('0.0001');
      expect(calculateAspFee(amount, feeBps)).toBe(expectedFee);
      const amount2 = 100n;
      const feeBps2 = 1n;
      expect(calculateAspFee(amount2, feeBps2)).toBe(0n);
    });
  });
});
