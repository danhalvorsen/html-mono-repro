import { expect, type Locator, type Page } from "@playwright/test";

export class VoiceControlPage {
  public constructor(
    private readonly page: Page,
  ) {}

  public get createVoiceButton(): Locator {
    return this.page.locator("#create-voice");
  }

  public get gateOnButton(): Locator {
    return this.page.locator("#gate-on");
  }

  public get gateOffButton(): Locator {
    return this.page.locator("#gate-off");
  }

  public get resetButton(): Locator {
    return this.page.locator("#reset");
  }

  public get state(): Locator {
    return this.page.locator("#voice-state");
  }

  public get frequency(): Locator {
    return this.page.locator("#voice-frequency");
  }

  public get velocity(): Locator {
    return this.page.locator("#voice-velocity");
  }

  public async open(): Promise<void> {
    await this.page.goto("/");
  }

  public async shouldBeNotCreated(): Promise<void> {
    await expect(this.state).toHaveText("not-created");
  }

  public async createVoice(): Promise<void> {
    await this.createVoiceButton.click();
  }

  public async gateOn(): Promise<void> {
    await this.gateOnButton.click();
  }

  public async gateOff(): Promise<void> {
    await this.gateOffButton.click();
  }

  public async reset(): Promise<void> {
    await this.resetButton.click();
  }
}
