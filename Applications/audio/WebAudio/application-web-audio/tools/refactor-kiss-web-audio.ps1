# Applications/audio/WebAudio/application-web-audio/tools/refactor-kiss-web-audio.ps1
# Run from repository root:
#   pwsh ./Applications/audio/WebAudio/application-web-audio/tools/refactor-kiss-web-audio.ps1
# or:
#   powershell -ExecutionPolicy Bypass -File .\Applications\audio\WebAudio\application-web-audio\tools\refactor-kiss-web-audio.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$srcRoot = Join-Path $projectRoot "src"

function Write-Utf8NoBomFile {
    param(
        [Parameter(Mandatory = $true)][string] $Path,
        [Parameter(Mandatory = $true)][string] $Content
    )

    $directory = Split-Path -Parent $Path
    if (-not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content.TrimStart("`r", "`n") + "`r`n", $utf8NoBom)
    Write-Host "Updated $Path"
}

$makeItPath = Join-Path $srcRoot "Audio/MakeIt.ts"
$defaultAudioNodeFactoryPath = Join-Path $srcRoot "Audio/DefaultAudioNodeFactory.ts"
$mixerBusPath = Join-Path $srcRoot "Audio/MixerBus.ts"
$simpleSynthPath = Join-Path $srcRoot "Audio/SimpleSynth.ts"
$simpleSynthBuilderPath = Join-Path $srcRoot "Audio/SimpleSynthBuilder.ts"
$synthPresetsPath = Join-Path $srcRoot "Audio/SynthPresets.ts"
$oscillatorModelPath = Join-Path $srcRoot "lit3/WebComponents/OscillatorControl/OscillatorModel.ts"
$synthesizerModelPath = Join-Path $srcRoot "lit3/WebComponents/Synthesizer/SynthesizerModel.ts"
$mrOscillatorControlsPath = Join-Path $srcRoot "lit3/WebComponents/OscillatorControl/MrOscillatorControls.ts"
$mrSynthControlsPath = Join-Path $srcRoot "lit3/WebComponents/Synthesizer/MrSynthControls.ts"
$synthesizerControllerPath = Join-Path $srcRoot "lit3/WebComponents/Synthesizer/SynthesizerController.ts"
$presetSynthFactoryPath = Join-Path $srcRoot "Audio/PresetSynthFactory.ts"

$makeIt = @'
import type { OscillatorModel } from "../lit3/WebComponents/OscillatorControl/OscillatorModel.js";

export interface IAudioComponent {
  connect(destination: AudioNode): void;
  disconnect(): void;
  dispose(): void;
}

export interface IStartable {
  start(when?: number): void;
  stop(when?: number): void;
}

export interface ISynthesizer extends IAudioComponent, IStartable {
  readonly output: AudioNode;
}

export interface IOscillatorConfig {
  readonly type: OscillatorType;
  readonly frequency: number;
  readonly detune: number;
}

export interface IGainConfig {
  readonly gain: number;
}

export interface IMixerConfig {
  readonly level: number;
}

export interface IAudioNodeFactory {
  createOscillator(config: IOscillatorConfig): OscillatorNode;
  createGain(config: IGainConfig): GainNode;
  createMixer(config: IMixerConfig): GainNode;
}

export interface ISynthBuilder {
  addOscillator(model: OscillatorModel): ISynthBuilder;
  withMixerLevel(value: number): ISynthBuilder;
  build(): ISynthesizer;
}

export class Guard {
  public static positive(name: string, value: number): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError(`${name} must be > 0`);
    }
  }

  public static gain(name: string, value: number): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(`${name} must be >= 0`);
    }
  }
}
'@

$defaultAudioNodeFactory = @'
import {
  Guard,
  type IAudioNodeFactory,
  type IGainConfig,
  type IMixerConfig,
  type IOscillatorConfig,
} from "./MakeIt.js";

export class DefaultAudioNodeFactory implements IAudioNodeFactory {
  public constructor(private readonly context: BaseAudioContext) {}

  public createOscillator(config: IOscillatorConfig): OscillatorNode {
    Guard.positive("frequency", config.frequency);

    const node = this.context.createOscillator();
    node.type = config.type;
    node.frequency.value = config.frequency;
    node.detune.value = config.detune;

    return node;
  }

  public createGain(config: IGainConfig): GainNode {
    Guard.gain("gain", config.gain);

    const node = this.context.createGain();
    node.gain.value = config.gain;

    return node;
  }

  public createMixer(config: IMixerConfig): GainNode {
    Guard.gain("level", config.level);

    const node = this.context.createGain();
    node.gain.value = config.level;

    return node;
  }
}
'@

$mixerBus = @'
import type { IAudioComponent, IAudioNodeFactory, IMixerConfig } from "./MakeIt.js";

export class MixerBus implements IAudioComponent {
  public readonly input: GainNode;
  public readonly output: GainNode;

  public constructor(factory: IAudioNodeFactory, config: IMixerConfig) {
    const mixer = factory.createMixer(config);
    this.input = mixer;
    this.output = mixer;
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public disconnect(): void {
    this.output.disconnect();
  }

  public dispose(): void {
    this.disconnect();
  }
}
'@

$simpleSynth = @'
import type { MixerBus } from "./MixerBus.js";
import type { ISynthesizer } from "./MakeIt.js";

export class SimpleSynth implements ISynthesizer {
  public readonly output: AudioNode;
  private started = false;

  public constructor(
    private readonly oscillators: readonly OscillatorNode[],
    private readonly gains: readonly GainNode[],
    private readonly mixer: MixerBus,
  ) {
    this.output = mixer.output;
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public disconnect(): void {
    this.output.disconnect();
  }

  public start(when = 0): void {
    if (this.started) {
      return;
    }

    for (const oscillator of this.oscillators) {
      oscillator.start(when);
    }

    this.started = true;
  }

  public stop(when = 0): void {
    if (!this.started) {
      return;
    }

    for (const oscillator of this.oscillators) {
      try {
        oscillator.stop(when);
      } catch {
        // ignored by design
      }
    }

    this.started = false;
  }

  public dispose(): void {
    this.disconnect();

    for (const oscillator of this.oscillators) {
      oscillator.disconnect();
    }

    for (const gain of this.gains) {
      gain.disconnect();
    }

    this.mixer.dispose();
  }
}
'@

$simpleSynthBuilder = @'
import type { OscillatorModel } from "../lit3/WebComponents/OscillatorControl/OscillatorModel.js";
import {
  Guard,
  type IAudioNodeFactory,
  type ISynthBuilder,
  type ISynthesizer,
} from "./MakeIt.js";
import { MixerBus } from "./MixerBus.js";
import { SimpleSynth } from "./SimpleSynth.js";

export class SimpleSynthBuilder implements ISynthBuilder {
  private readonly oscillators: OscillatorModel[] = [];
  private mixerLevel = 1;

  public constructor(private readonly factory: IAudioNodeFactory) {}

  public addOscillator(model: OscillatorModel): ISynthBuilder {
    Guard.positive("frequency", model.frequency);
    Guard.gain("gain", model.gain);

    this.oscillators.push(model);
    return this;
  }

  public withMixerLevel(value: number): ISynthBuilder {
    Guard.gain("mixerLevel", value);
    this.mixerLevel = value;
    return this;
  }

  public build(): ISynthesizer {
    const normalizedOscillators = this.normalizeOscillators(this.oscillators);

    const mixer = new MixerBus(this.factory, {
      level: this.normalizeMixerLevel(this.mixerLevel, normalizedOscillators.length),
    });

    const oscillatorNodes: OscillatorNode[] = [];
    const gainNodes: GainNode[] = [];

    for (const oscillator of normalizedOscillators) {
      const oscillatorNode = this.factory.createOscillator({
        type: oscillator.type,
        frequency: oscillator.frequency,
        detune: oscillator.detune,
      });

      const gainNode = this.factory.createGain({
        gain: oscillator.gain,
      });

      oscillatorNode.connect(gainNode);
      gainNode.connect(mixer.input);

      oscillatorNodes.push(oscillatorNode);
      gainNodes.push(gainNode);
    }

    return new SimpleSynth(oscillatorNodes, gainNodes, mixer);
  }

  private normalizeOscillators(
    oscillators: readonly OscillatorModel[],
  ): readonly OscillatorModel[] {
    if (oscillators.length === 0) {
      return [
        {
          id: "osc-default",
          type: "sine",
          frequency: 440,
          detune: 0,
          gain: 0.25,
        },
      ];
    }

    const totalGain = oscillators.reduce((sum, item) => sum + item.gain, 0);

    if (totalGain <= 1) {
      return [...oscillators];
    }

    const scale = 1 / totalGain;

    return oscillators.map((item) => ({
      ...item,
      gain: item.gain * scale,
    }));
  }

  private normalizeMixerLevel(level: number, oscillatorCount: number): number {
    if (oscillatorCount <= 1) {
      return level;
    }

    return Math.min(level, 1 / Math.sqrt(oscillatorCount));
  }
}
'@

$synthPresets = @'
import type { SynthesizerModel } from "../lit3/WebComponents/Synthesizer/SynthesizerModel.js";

export const SynthPresets = {
  default: {
    oscillators: [
      {
        id: "default-osc-1",
        type: "sine",
        frequency: 440,
        detune: 0,
        gain: 0.25,
      },
    ],
    mixerLevel: 1,
  },
  lead: {
    oscillators: [
      {
        id: "lead-osc-1",
        type: "sawtooth",
        frequency: 660,
        detune: 0,
        gain: 0.15,
      },
      {
        id: "lead-osc-2",
        type: "sawtooth",
        frequency: 660,
        detune: 8,
        gain: 0.15,
      },
    ],
    mixerLevel: 1,
  },
  bass: {
    oscillators: [
      {
        id: "bass-osc-1",
        type: "square",
        frequency: 110,
        detune: -4,
        gain: 0.2,
      },
      {
        id: "bass-osc-2",
        type: "sine",
        frequency: 55,
        detune: 0,
        gain: 0.1,
      },
    ],
    mixerLevel: 1,
  },
} satisfies Record<string, SynthesizerModel>;
'@

$oscillatorModel = @'
export type OscillatorModel = Readonly<{
  id: string;
  type: OscillatorType;
  frequency: number;
  detune: number;
  gain: number;
}>;
'@

$synthesizerModel = @'
import type { OscillatorModel } from "../OscillatorControl/OscillatorModel.js";

export type SynthesizerModel = Readonly<{
  oscillators: readonly OscillatorModel[];
  mixerLevel: number;
}>;
'@

$mrOscillatorControls = @'
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./Atomic/MrOscillatorTypeSelect.js";
import "./Atomic/MrSlider.js";
import type { OscillatorModel } from "./OscillatorModel.js";

@customElement("mr-oscillator-controls")
export class MrOscillatorControls extends LitElement {
  @property({ attribute: false })
  public model: OscillatorModel = {
    id: "osc-1",
    type: "sine",
    frequency: 440,
    detune: 0,
    gain: 0.25,
  };

  public static override styles = css`
    :host {
      display: block;
      padding: 0.75rem;
      border: 1px solid #444;
      border-radius: 8px;
    }

    .panel {
      display: grid;
      gap: 0.75rem;
    }

    label {
      display: grid;
      gap: 0.25rem;
    }
  `;

  protected override render() {
    return html`
      <div class="panel">
        <mr-oscillator-type-select
          .value=${this.model.type}
          @value-change=${this.onTypeChange}>
        </mr-oscillator-type-select>

        <label>
          Frequency
          <mr-slider
            .value=${this.model.frequency}
            .min=${20}
            .max=${2000}
            .step=${1}
            @value-change=${this.onFrequencyChange}>
          </mr-slider>
        </label>

        <label>
          Detune
          <mr-slider
            .value=${this.model.detune}
            .min=${-1200}
            .max=${1200}
            .step=${1}
            @value-change=${this.onDetuneChange}>
          </mr-slider>
        </label>

        <label>
          Gain
          <mr-slider
            .value=${this.model.gain}
            .min=${0}
            .max=${1}
            .step=${0.01}
            @value-change=${this.onGainChange}>
          </mr-slider>
        </label>
      </div>
    `;
  }

  private readonly onTypeChange = (event: CustomEvent<OscillatorType>): void => {
    this.updateModel({ type: event.detail });
  };

  private readonly onFrequencyChange = (event: CustomEvent<number>): void => {
    this.updateModel({ frequency: event.detail });
  };

  private readonly onDetuneChange = (event: CustomEvent<number>): void => {
    this.updateModel({ detune: event.detail });
  };

  private readonly onGainChange = (event: CustomEvent<number>): void => {
    this.updateModel({ gain: event.detail });
  };

  private updateModel(patch: Partial<OscillatorModel>): void {
    this.model = {
      ...this.model,
      ...patch,
    };

    this.dispatchEvent(
      new CustomEvent<OscillatorModel>("oscillator-change", {
        detail: this.model,
        bubbles: true,
        composed: true,
      }),
    );
  }
}
'@

$synthesizerController = @'
import { DefaultAudioNodeFactory } from "../../../Audio/DefaultAudioNodeFactory.js";
import type { ISynthesizer } from "../../../Audio/MakeIt.js";
import { SimpleSynthBuilder } from "../../../Audio/SimpleSynthBuilder.js";
import { SynthPresets } from "../../../Audio/SynthPresets.js";
import type { SynthesizerModel } from "./SynthesizerModel.js";

export class SynthesizerController {
  private context: AudioContext | null = null;
  private synth: ISynthesizer | null = null;
  private model: SynthesizerModel = SynthPresets.default;

  public get isPlaying(): boolean {
    return this.synth !== null;
  }

  public get synthesizerModel(): SynthesizerModel {
    return this.model;
  }

  public setModel(model: SynthesizerModel): void {
    this.model = model;
  }

  public async toggle(): Promise<void> {
    if (this.synth !== null) {
      this.stop();
      return;
    }

    await this.start();
  }

  public async start(): Promise<void> {
    const context = this.getOrCreateContext();

    if (context.state !== "running") {
      await context.resume();
    }

    if (this.synth !== null) {
      return;
    }

    this.synth = this.createSynth(context);
    this.synth.connect(context.destination);
    this.synth.start(context.currentTime);
  }

  public stop(): void {
    if (this.synth === null) {
      return;
    }

    const synth = this.synth;
    this.synth = null;

    try {
      synth.stop();
    } finally {
      synth.dispose();
    }
  }

  public dispose(): void {
    this.stop();

    if (this.context !== null && this.context.state !== "closed") {
      void this.context.close();
    }

    this.context = null;
  }

  private createSynth(context: AudioContext): ISynthesizer {
    const builder = new SimpleSynthBuilder(new DefaultAudioNodeFactory(context))
      .withMixerLevel(this.model.mixerLevel);

    for (const oscillator of this.model.oscillators) {
      builder.addOscillator(oscillator);
    }

    return builder.build();
  }

  private getOrCreateContext(): AudioContext {
    if (this.context !== null) {
      return this.context;
    }

    this.context = new AudioContext();
    return this.context;
  }
}
'@

$mrSynthControls = @'
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../MrSynthToggle.js";
import "../OscillatorControl/MrOscillatorControls.js";
import type { OscillatorModel } from "../OscillatorControl/OscillatorModel.js";
import type { SynthesizerModel } from "./SynthesizerModel.js";
import { SynthesizerController } from "./SynthesizerController.js";
import { SynthPresets } from "../../../Audio/SynthPresets.js";

@customElement("mr-synth-controls")
export class MrSynthControls extends LitElement {
  @property({ attribute: false })
  public model: SynthesizerModel = SynthPresets.default;

  @state()
  private playing = false;

  private readonly controller = new SynthesizerController();

  protected override firstUpdated(): void {
    this.controller.setModel(this.model);
  }

  protected override render() {
    return html`
      <mr-synth-toggle
        .playing=${this.playing}
        @toggle-requested=${this.onToggleRequested}>
      </mr-synth-toggle>

      <ul>
        ${this.model.oscillators.map((oscillator) => html`
          <li>
            <mr-oscillator-controls
              .model=${oscillator}
              @oscillator-change=${this.onOscillatorChanged}>
            </mr-oscillator-controls>
          </li>
        `)}
      </ul>
    `;
  }

  public override disconnectedCallback(): void {
    this.controller.dispose();
    super.disconnectedCallback();
  }

  private readonly onToggleRequested = async (): Promise<void> => {
    this.controller.setModel(this.model);
    await this.controller.toggle();
    this.playing = this.controller.isPlaying;
  };

  private readonly onOscillatorChanged = (event: CustomEvent<OscillatorModel>): void => {
    const updated = event.detail;

    this.model = {
      ...this.model,
      oscillators: this.model.oscillators.map((item) =>
        item.id === updated.id ? updated : item,
      ),
    };

    this.controller.setModel(this.model);

    this.dispatchEvent(
      new CustomEvent<SynthesizerModel>("synthesizer-change", {
        detail: this.model,
        bubbles: true,
        composed: true,
      }),
    );
  };
}
'@

Write-Utf8NoBomFile -Path $makeItPath -Content $makeIt
Write-Utf8NoBomFile -Path $defaultAudioNodeFactoryPath -Content $defaultAudioNodeFactory
Write-Utf8NoBomFile -Path $mixerBusPath -Content $mixerBus
Write-Utf8NoBomFile -Path $simpleSynthPath -Content $simpleSynth
Write-Utf8NoBomFile -Path $simpleSynthBuilderPath -Content $simpleSynthBuilder
Write-Utf8NoBomFile -Path $synthPresetsPath -Content $synthPresets
Write-Utf8NoBomFile -Path $oscillatorModelPath -Content $oscillatorModel
Write-Utf8NoBomFile -Path $synthesizerModelPath -Content $synthesizerModel
Write-Utf8NoBomFile -Path $mrOscillatorControlsPath -Content $mrOscillatorControls
Write-Utf8NoBomFile -Path $synthesizerControllerPath -Content $synthesizerController
Write-Utf8NoBomFile -Path $mrSynthControlsPath -Content $mrSynthControls

if (Test-Path $presetSynthFactoryPath) {
    Remove-Item $presetSynthFactoryPath -Force
    Write-Host "Removed $presetSynthFactoryPath"
}

Write-Host ""
Write-Host "KISS refactor applied."
Write-Host "Next:"
Write-Host "  pnpm -C `"$projectRoot`" build"