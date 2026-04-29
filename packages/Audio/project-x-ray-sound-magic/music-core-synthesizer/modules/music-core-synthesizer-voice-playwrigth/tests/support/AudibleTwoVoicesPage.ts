import { expect, type Locator, type Page } from "@playwright/test";

const AudibleTwoVoicesRoute = {
  Default: "/audible-two-voices-two-oscillators.html?durationMs=5000",
} as const;

const AudibleTwoVoicesSelector = {
  PlayTwoVoices: "#play-two-voices",
  State: "#voice-state",
  VoiceCount: "#voice-count",
  Voice1Oscillators: "#voice-1-oscillators",
  Voice2Oscillators: "#voice-2-oscillators",
  Frequencies: "#voice-frequencies",
  ElapsedMilliseconds: "#voice-elapsed-ms",
  Error: "#voice-error",
} as const;

export class AudibleTwoVoicesPage {
  public constructor(
    private readonly page: Page,
  ) {}

  public get state(): Locator {
    return this.page.locator(AudibleTwoVoicesSelector.State);
  }

  public get elapsedMilliseconds(): Locator {
    return this.page.locator(AudibleTwoVoicesSelector.ElapsedMilliseconds);
  }

  public async open(): Promise<void> {
    await this.page.goto(AudibleTwoVoicesRoute.Default);
  }

  public async shouldHaveBoundOscillators(): Promise<void> {
    await expect(this.page.locator(AudibleTwoVoicesSelector.State)).toHaveText("idle");
    await expect(this.page.locator(AudibleTwoVoicesSelector.VoiceCount)).toHaveText("2");
    await expect(this.page.locator(AudibleTwoVoicesSelector.Voice1Oscillators)).toHaveText("osc-v1-a,osc-v1-b");
    await expect(this.page.locator(AudibleTwoVoicesSelector.Voice2Oscillators)).toHaveText("osc-v2-a,osc-v2-b");
    await expect(this.page.locator(AudibleTwoVoicesSelector.Frequencies)).toHaveText("261.63,329.63,392,523.25");
    await expect(this.page.locator(AudibleTwoVoicesSelector.Error)).toHaveText("");
  }

  public async play(): Promise<void> {
    await this.page.locator(AudibleTwoVoicesSelector.PlayTwoVoices).click();
    await expect(this.state).toHaveText("playing");
  }

  public async shouldStopAfterAudiblePlayback(): Promise<void> {
    await expect(this.state).toHaveText("stopped", {
      timeout: 8_000,
    });

    const elapsedText = await this.elapsedMilliseconds.textContent();
    const elapsedMilliseconds = Number(elapsedText);

    expect(Number.isFinite(elapsedMilliseconds)).toBe(true);
    expect(elapsedMilliseconds).toBeGreaterThanOrEqual(4_500);
    expect(elapsedMilliseconds).toBeLessThanOrEqual(6_000);

    await expect(this.page.locator(AudibleTwoVoicesSelector.Error)).toHaveText("");
  }
}
