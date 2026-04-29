import { expect, type Locator } from "@playwright/test";

export interface IExpectedElapsedRange {
  readonly minimumMilliseconds: number;
  readonly maximumMilliseconds: number;
}

export class BrowserPlaybackAssertions {
  public static async shouldHaveElapsedWithinRange(
    elapsedLocator: Locator,
    expected: IExpectedElapsedRange,
  ): Promise<void> {
    const elapsedText = await elapsedLocator.textContent();
    const elapsedMilliseconds = Number(elapsedText);

    expect(Number.isFinite(elapsedMilliseconds)).toBe(true);
    expect(elapsedMilliseconds).toBeGreaterThanOrEqual(
      expected.minimumMilliseconds,
    );
    expect(elapsedMilliseconds).toBeLessThanOrEqual(
      expected.maximumMilliseconds,
    );
  }
}
