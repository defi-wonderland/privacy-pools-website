import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { truncateAddress, formatTimestamp } from '~/utils';

describe('formatUtils', () => {
  describe('truncateAddress', () => {
    it('should correctly truncate a long wallet address', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      expect(truncateAddress(address)).toBe('0x1234...5678');
    });

    it('should return an empty string if address is undefined', () => {
      expect(truncateAddress(undefined)).toBe('');
    });

    it('should return an empty string if address is empty', () => {
      expect(truncateAddress('')).toBe('');
    });

    it('should return the original address if it is short (e.g., 3 chars)', () => {
      const shortAddress = '0x1';
      expect(truncateAddress(shortAddress)).toBe('0x1');
    });

    it('should return the original address if it is short (e.g., 10 chars)', () => {
      const shortAddress = '0x12345678';
      expect(truncateAddress(shortAddress)).toBe('0x12345678');
    });

    it('should truncate address if it is just above threshold (e.g., 11 chars)', () => {
      const mediumAddress = '0x123456789';
      expect(truncateAddress(mediumAddress)).toBe('0x1234...6789');
    });
  });

  describe('formatTimestamp', () => {
    const realDateNow = Date.now;
    const mockStaticDate = new Date('2024-01-15T12:00:00.000Z');
    const mockDateNowFn = jest.fn(() => mockStaticDate.getTime());

    beforeEach(() => {
      Date.now = mockDateNowFn;
    });

    afterEach(() => {
      Date.now = realDateNow;
      jest.restoreAllMocks();
    });

    it('should return "-" if timestamp is undefined', () => {
      expect(formatTimestamp(undefined)).toBe('-');
    });

    it('should return "-" if timestamp results in an invalid date', () => {
      expect(formatTimestamp('not-a-timestamp')).toBe('-');
    });

    describe('when timezone offset is 0 (simulating UTC)', () => {
      beforeEach(() => {
        jest.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(0);
      });

      it('should format a timestamp in seconds (short format, local time display)', () => {
        const timestampSec = '1705315800';
        expect(formatTimestamp(timestampSec)).toBe('15/01/2024 07:50');
      });

      it('should format a timestamp in milliseconds (short format, local time display)', () => {
        const timestampMs = '1705315800000';
        expect(formatTimestamp(timestampMs)).toBe('15/01/2024 07:50');
      });

      it('should format a timestamp in milliseconds (full format, local time display, UTC+0 suffix)', () => {
        const timestampMs = '1705315800000';
        expect(formatTimestamp(timestampMs, true)).toBe('15/01/2024 07:50 UTC+0');
      });

      it('should correctly pad day and month for local time display, potentially changing day (UTC+0 suffix)', () => {
        const timestampSec = '1672531200';
        expect(formatTimestamp(timestampSec)).toBe('31/12/2022 21:00');
      });

      it('should correctly format and pad for full format when day changes (local time display, UTC+0 suffix)', () => {
        const timestampSec = '1672531200';
        expect(formatTimestamp(timestampSec, true)).toBe('31/12/2022 21:00 UTC+0');
      });
    });

    describe('when timezone offset is 180 (simulating UTC-3 / local is 3 hours behind UTC)', () => {
      beforeEach(() => {
        jest.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(180);
      });

      it('should format a timestamp in seconds (short format)', () => {
        const timestampSec = '1705315800';
        expect(formatTimestamp(timestampSec)).toBe('15/01/2024 07:50');
      });

      it('should format a timestamp in seconds (full format, local time display, UTC-3 suffix)', () => {
        const timestampSec = '1705315800';
        expect(formatTimestamp(timestampSec, true)).toBe('15/01/2024 07:50 UTC-3');
      });

      it('should correctly pad day and month for local time display (UTC-3 suffix), potentially changing day', () => {
        const timestampSec = '1672531200';
        expect(formatTimestamp(timestampSec, true)).toBe('31/12/2022 21:00 UTC-3');
      });
    });
  });
});
