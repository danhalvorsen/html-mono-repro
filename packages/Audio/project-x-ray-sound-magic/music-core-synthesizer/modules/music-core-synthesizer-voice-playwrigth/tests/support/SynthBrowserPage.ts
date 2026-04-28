import { expect, type Locator, type Page } from "@playwright/test";

import { BrowserPlaybackAssertions } from "./BrowserPlaybackAssertions.js";

export class SynthBrowserPage {
  public constructor(
    private readonly page: Page,
  ) {}

  public get playButton(): Locator {
    return this.page
      .locator("#play-voice, #play-oscillator, #play-envelope-voice")
      .first();
  }

  public get state(): Locator {
    return this.page
      .locator("#voice-state, #oscillator-state, #envelope-state")
      .first();
  }

  public get elapsedMilliseconds(): Locator {
    return this.page
      .locator("#voice-elapsed-ms, #oscillator-elapsed-ms, #envelope-elapsed-ms")
      .first();
  }

  public get error(): Locator {
    return this.page
      .locator("#voice-error, #oscillator-error, #envelope-error")
      .first();
  }

  public async open(path: string): Promise<void> {
    await this.page.goto(path);
  }

  public async shouldBeIdle(): Promise<void> {
    await expect(this.state).toHaveText("idle");
    await expect(this.elapsedMilliseconds).toHaveText("0");
    await expect(this.error).toHaveText("");
  }

  public async play(): Promise<void> {
    await this.playButton.click();
    await expect(this.state).toHaveText("playing");
  }

  public async shouldStopWithin(request: {
    readonly timeoutMilliseconds: number;
    readonly minimumElapsedMilliseconds: number;
    readonly maximumElapsedMilliseconds: number;
  }): Promise<void> {
    await expect(this.state).toHaveText("stopped", {
      timeout: request.timeoutMilliseconds,
    });

    await BrowserPlaybackAssertions.shouldHaveElapsedWithinRange(
      this.elapsedMilliseconds,
      {
        minimumMilliseconds: request.minimumElapsedMilliseconds,
        maximumMilliseconds: request.maximumElapsedMilliseconds,
      },
    );

    await expect(this.error).toHaveText("");
  }
}
