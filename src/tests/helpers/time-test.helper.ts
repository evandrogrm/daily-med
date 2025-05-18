export class TimeTestHelper {
  private static originalDateNow: () => number;
  private static mockDate: Date;

  static freezeTime(date: Date = new Date()) {
    this.mockDate = date;
    this.originalDateNow = Date.now;

    global.Date.now = jest.fn(() => this.mockDate.getTime());

    const OriginalDate = global.Date;

    global.Date = class extends OriginalDate {
      constructor() {
        super();
        return new OriginalDate(TimeTestHelper.mockDate);
      }

      static now() {
        return TimeTestHelper.mockDate.getTime();
      }
    } as any;

    Object.assign(global.Date, OriginalDate);
  }

  static advanceTime(ms: number) {
    if (!this.mockDate) {
      throw new Error('Time is not frozen. Call freezeTime() first.');
    }

    this.mockDate = new Date(this.mockDate.getTime() + ms);
    (Date.now as jest.Mock).mockReturnValue(this.mockDate.getTime());
  }

  static resetTime() {
    if (this.originalDateNow) {
      global.Date.now = this.originalDateNow;
      this.originalDateNow = undefined as any;
    }

    global.Date = Date;
  }

  static async withFrozenTime(date: Date, callback: () => Promise<void>) {
    try {
      this.freezeTime(date);
      await callback();
    } finally {
      this.resetTime();
    }
  }

  static async withAdvancedTime(ms: number, callback: () => Promise<void>) {
    const originalNow = Date.now();
    const targetTime = originalNow + ms;

    try {
      this.freezeTime(new Date(originalNow));
      await callback();
      this.advanceTime(targetTime - Date.now());
    } finally {
      this.resetTime();
    }
  }
}
