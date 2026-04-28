import { expect, type Locator, type Page } from "@playwright/test";

const AudibleVoiceStateRoute = {
  Default: "/audible-voice-state.html?durationMs=5000",
} as const;

const AudibleVoiceStateSelector = {
  CreateVoice: "#create-voice",
  PlayVoice: "#play-voice",
  Reset: "#reset",
  State: "#voice-state",
  Frequency: "#voice-frequency",
  Velocity: "#voice-velocity",
  DurationMilliseconds: "#voice-duration-ms",
  ElapsedMilliseconds: "#voice-elapsed-ms",
  Error: "#voice-error",
} as const;

export class AudibleVoiceStatePage {
  public constructor(
    private readonly page: Page,
  ) {}

  public get state(): Locator {
    return this.page.locator(AudibleVoiceStateSelector.State);
  }

  public get frequency(): Locator {
    return this.page.locator(AudibleVoiceStateSelector.Frequency);
  }

  public get velocity(): Locator {
    return this.page.locator(AudibleVoiceStateSelector.Velocity);
  }

  public get elapsedMilliseconds(): Locator {
    return this.page.locator(AudibleVoiceStateSelector.ElapsedMilliseconds);
  }

  public get error(): Locator {
    return this.page.locator(AudibleVoiceStateSelector.Error);
  }

  public async open(): Promise<void> {
    await this.page.goto(AudibleVoiceStateRoute.Default);
  }

  public async shouldBeNotCreated(): Promise<void> {
    await expect(this.state).toHaveText("not-created");
    await expect(this.frequency).toHaveText("none");
    await expect(this.velocity).toHaveText("0");
    await expect(this.error).toHaveText("");
  }

  public async createVoice(): Promise<void> {
    await this.page.locator(AudibleVoiceStateSelector.CreateVoice).click();
  }

  public async playVoice(): Promise<void> {
    await this.page.locator(AudibleVoiceStateSelector.PlayVoice).click();
  }

  public async reset(): Promise<void> {
    await this.page.locator(AudibleVoiceStateSelector.Reset).click();
  }

  public async shouldBeIdle(): Promise<void> {
    await expect(this.state).toHaveText("idle");
    await expect(this.frequency).toHaveText("none");
    await expect(this.velocity).toHaveText("0");
  }

  public async shouldBeActive(): Promise<void> {
    await expect(this.state).toHaveText("active");
    await expect(this.frequency).toHaveText("440");
    await expect(this.velocity).toHaveText("0.75");
  }

  public async shouldBeReleasedAfterAudiblePlayback(): Promise<void> {
    await expect(this.state).toHaveText("released", {
      timeout: 8_000,
    });

    await expect(this.velocity).toHaveText("0");

    const elapsedText = await this.elapsedMilliseconds.textContent();
    const elapsedMilliseconds = Number(elapsedText);

    expect(Number.isFinite(elapsedMilliseconds)).toBe(true);
    expect(elapsedMilliseconds).toBeGreaterThanOrEqual(4_500);
    expect(elapsedMilliseconds).toBeLessThanOrEqual(6_000);

    await expect(this.error).toHaveText("");
  }
}
