import { TimeTestHelper } from '../../helpers/time-test.helper';

describe('TimeTestHelper', () => {
  const originalDateNow = Date.now;
  const fixedDate = new Date('2023-01-01T00:00:00Z');

  afterEach(() => {
    TimeTestHelper.resetTime();
    jest.useRealTimers();
  });

  describe('freezeTime', () => {
    it('should freeze time to a specific date', () => {
      TimeTestHelper.freezeTime(fixedDate);

      const now = new Date();
      expect(now.getTime()).toBe(fixedDate.getTime());
      expect(Date.now()).toBe(fixedDate.getTime());
    });

    it('should use current time if no date is provided', () => {
      const before = Date.now();
      TimeTestHelper.freezeTime();
      const after = Date.now();

      expect(after).toBe(before);
    });
  });

  describe('advanceTime', () => {
    it('should advance time by the specified milliseconds', () => {
      TimeTestHelper.freezeTime(fixedDate);

      TimeTestHelper.advanceTime(advanceMs);

      const expectedTime = fixedDate.getTime() + advanceMs;
      expect(Date.now()).toBe(expectedTime);

      const now = new Date();
      expect(now.getTime()).toBe(expectedTime);
    });

    it('should throw an error if time is not frozen', () => {
      expect(() => {
        TimeTestHelper.advanceTime(1000);
      }).toThrow('Time is not frozen. Call freezeTime() first.');
    });
  });

  describe('resetTime', () => {
    it('should reset time to the system time', () => {
      TimeTestHelper.freezeTime(fixedDate);
      TimeTestHelper.resetTime();

      const now = Date.now();
      const systemNow = originalDateNow();

      expect(Math.abs(now - systemNow)).toBeLessThan(100);
    });
  });

  describe('withFrozenTime', () => {
    it('should execute callback with frozen time', async () => {
      const callback = jest.fn();

      await TimeTestHelper.withFrozenTime(fixedDate, async () => {
        expect(new Date().getTime()).toBe(fixedDate.getTime());
        callback();
      });

      expect(callback).toHaveBeenCalled();

      expect(Math.abs(Date.now() - originalDateNow())).toBeLessThan(100);
    });

    it('should reset time even if callback throws', async () => {
      const error = new Error('Test error');

      await expect(
        TimeTestHelper.withFrozenTime(fixedDate, async () => {
          throw error;
        })
      ).rejects.toThrow(error);

      expect(Math.abs(Date.now() - originalDateNow())).toBeLessThan(100);
    });
  });

  describe('withAdvancedTime', () => {
    it('should execute callback with advanced time', async () => {
      const startTime = Date.now();

      await TimeTestHelper.withAdvancedTime(advanceMs, async () => {
        const now = Date.now();
        expect(now).toBeGreaterThanOrEqual(startTime + advanceMs);
      });

      expect(Math.abs(Date.now() - originalDateNow())).toBeLessThan(100);
    });
  });
});
