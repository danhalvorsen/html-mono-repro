interface TestOscillatorDefinition {
  readonly voiceId: string;
  readonly oscillatorId: string;
  readonly label: string;
}

interface TestVoiceDefinition {
  readonly voiceId: string;
  readonly oscillators: readonly TestOscillatorDefinition[];
}

interface TestVoiceOwnershipResult {
  readonly voiceId: string;
  readonly oscillatorIds: readonly string[];
  readonly invalidOscillatorIds: readonly string[];
}

interface TestScenarioResult {
  readonly voiceCount: number;
  readonly oscillatorCount: number;
  readonly voices: readonly TestVoiceOwnershipResult[];
  readonly isValid: boolean;
}

declare global {
  interface Window {
    readonly twoVoicesTwoOscillatorsScenario: {
      read(): TestScenarioResult;
    };
  }
}

class TwoVoicesTwoOscillatorsScenario {
  private readonly voices: readonly TestVoiceDefinition[];

  public constructor(voices: readonly TestVoiceDefinition[]) {
    this.voices = voices;
  }

  public read(): TestScenarioResult {
    const results = this.voices.map((voice): TestVoiceOwnershipResult => {
      const oscillatorIds = voice.oscillators.map((oscillator) => oscillator.oscillatorId);

      const invalidOscillatorIds = voice.oscillators
        .filter((oscillator) => oscillator.voiceId !== voice.voiceId)
        .map((oscillator) => oscillator.oscillatorId);

      return {
        voiceId: voice.voiceId,
        oscillatorIds,
        invalidOscillatorIds,
      };
    });

    return {
      voiceCount: this.voices.length,
      oscillatorCount: this.voices.reduce((count, voice) => count + voice.oscillators.length, 0),
      voices: results,
      isValid: results.every((voice) => voice.invalidOscillatorIds.length === 0),
    };
  }
}

class TwoVoicesTwoOscillatorsView {
  private readonly host: HTMLElement;
  private readonly voices: readonly TestVoiceDefinition[];

  public constructor(host: HTMLElement, voices: readonly TestVoiceDefinition[]) {
    this.host = host;
    this.voices = voices;
  }

  public render(): void {
    this.host.replaceChildren(...this.voices.map((voice) => this.createVoiceElement(voice)));
  }

  private createVoiceElement(voice: TestVoiceDefinition): HTMLElement {
    const section = document.createElement("section");
    section.dataset.testid = "voice";
    section.dataset.voiceId = voice.voiceId;

    const title = document.createElement("h2");
    title.textContent = voice.voiceId;

    const list = document.createElement("ul");
    list.replaceChildren(...voice.oscillators.map((oscillator) => this.createOscillatorElement(oscillator)));

    section.append(title, list);

    return section;
  }

  private createOscillatorElement(oscillator: TestOscillatorDefinition): HTMLElement {
    const item = document.createElement("li");
    item.dataset.testid = "oscillator";
    item.dataset.voiceId = oscillator.voiceId;
    item.dataset.oscillatorId = oscillator.oscillatorId;
    item.textContent = oscillator.label;

    return item;
  }
}

const voices: readonly TestVoiceDefinition[] = [
  {
    voiceId: "voice-v1",
    oscillators: [
      {
        voiceId: "voice-v1",
        oscillatorId: "voice-v1.osc-v1",
        label: "Voice V1 / Osc V1",
      },
      {
        voiceId: "voice-v1",
        oscillatorId: "voice-v1.osc-v2",
        label: "Voice V1 / Osc V2",
      },
    ],
  },
  {
    voiceId: "voice-v2",
    oscillators: [
      {
        voiceId: "voice-v2",
        oscillatorId: "voice-v2.osc-v1",
        label: "Voice V2 / Osc V1",
      },
      {
        voiceId: "voice-v2",
        oscillatorId: "voice-v2.osc-v2",
        label: "Voice V2 / Osc V2",
      },
    ],
  },
];

const root = document.querySelector<HTMLElement>("#app");

if (root === null) {
  throw new Error("Missing #app root element.");
}

new TwoVoicesTwoOscillatorsView(root, voices).render();

Object.defineProperty(window, "twoVoicesTwoOscillatorsScenario", {
  value: new TwoVoicesTwoOscillatorsScenario(voices),
  writable: false,
  configurable: false,
});

export {};