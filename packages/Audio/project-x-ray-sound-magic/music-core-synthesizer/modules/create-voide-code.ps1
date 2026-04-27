# FILE: create-voice-modules.ps1

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$StartPath = (Get-Location).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$BackupStamp = Get-Date -Format "yyyyMMdd-HHmmss"

function Resolve-ModulesRoot {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $current = (Resolve-Path -LiteralPath $Path).Path

    while ($true) {
        $direct = Join-Path $current "music-core-synthesizer\modules"
        if (Test-Path -LiteralPath $direct -PathType Container) {
            return $direct
        }

        $monorepoRelative = Join-Path $current "packages\Audio\project-x-ray-sound-magic\music-core-synthesizer\modules"
        if (Test-Path -LiteralPath $monorepoRelative -PathType Container) {
            return $monorepoRelative
        }

        $parent = Split-Path -Parent $current

        if ([string]::IsNullOrWhiteSpace($parent) -or $parent -eq $current) {
            break
        }

        $current = $parent
    }

    throw "Could not find music-core-synthesizer\modules from: $Path"
}

function Backup-File {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        Copy-Item `
            -LiteralPath $Path `
            -Destination "$Path.bak.$BackupStamp" `
            -Force
    }
}

function Write-Utf8File {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Content
    )

    $directory = Split-Path -Parent $Path

    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }

    $normalized = $Content.TrimEnd() + [Environment]::NewLine

    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        $existing = Get-Content -LiteralPath $Path -Raw

        if ($existing -eq $normalized) {
            Write-Host "Unchanged: $Path"
            return
        }

        Backup-File -Path $Path
    }

    [System.IO.File]::WriteAllText($Path, $normalized, $Utf8NoBom)
    Write-Host "Written:   $Path"
}

function Write-Package {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PackageName,

        [Parameter(Mandatory = $true)]
        [hashtable]$Files
    )

    $packageRoot = Join-Path $ModulesRoot $PackageName

    foreach ($relativePath in $Files.Keys) {
        Write-Utf8File `
            -Path (Join-Path $packageRoot $relativePath) `
            -Content $Files[$relativePath]
    }
}

$ModulesRoot = Resolve-ModulesRoot -Path $StartPath

Write-Host "Modules root: $ModulesRoot"
Write-Host ""

$CommonTsConfig = @'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules", "tests"]
}
'@

# ---------------------------------------------------------------------------
# 1. music-core-synthesizer-voice-contracts
# ---------------------------------------------------------------------------

Write-Package `
    -PackageName "music-core-synthesizer-voice-contracts" `
    -Files @{
        "package.json" = @'
{
  "name": "@monorepo/music-core-synthesizer-voice-contracts",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run"
  },
  "dependencies": {
    "@monorepo/music-core-synthesizer-envelopes-contracts": "workspace:*",
    "@monorepo/music-core-synthesizer-oscillators-contracts": "workspace:*"
  },
  "devDependencies": {
    "chai": "^5.1.2",
    "typescript": "~6.0.2",
    "vitest": "^3.2.4"
  }
}
'@

        "tsconfig.json" = $CommonTsConfig

        "src/VoiceDefinition.ts" = @'
import type { EnvelopeDefinition } from "@monorepo/music-core-synthesizer-envelopes-contracts";
import type { OscillatorDefinition } from "@monorepo/music-core-synthesizer-oscillators-contracts";

export interface IVoiceLayerDefinition {
  readonly enabled: boolean;
  readonly oscillator: OscillatorDefinition;
  readonly envelope: EnvelopeDefinition;
  readonly gain: number;
}

export interface IVoiceDefinition {
  readonly layers: readonly IVoiceLayerDefinition[];
  readonly outputGain: number;
}
'@

        "src/VoiceGate.ts" = @'
export interface IVoiceGateOnRequest {
  readonly timeSeconds: number;
  readonly frequencyHz: number;
  readonly velocity: number;
}

export interface IVoiceGateOffRequest {
  readonly timeSeconds: number;
}
'@

        "src/index.ts" = @'
export * from "./VoiceDefinition.js";
export * from "./VoiceGate.js";
'@

        "src/code.ts" = @'
export * from "./index.js";
'@

        "tests/VoiceDefinition.contract.test.ts" = @'
import { should } from "chai";
import { describe, it } from "vitest";

import type { IVoiceDefinition } from "../src/index.js";

should();

describe("IVoiceDefinition", () => {
  it("should support an immutable voice definition shape", () => {
    const definition: IVoiceDefinition = {
      layers: [],
      outputGain: 0.75,
    };

    definition.layers.length.should.equal(0);
    definition.outputGain.should.equal(0.75);
  });
});
'@
    }

# ---------------------------------------------------------------------------
# 2. music-core-synthesizer-voice
# ---------------------------------------------------------------------------

Write-Package `
    -PackageName "music-core-synthesizer-voice" `
    -Files @{
        "package.json" = @'
{
  "name": "@monorepo/music-core-synthesizer-voice",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run"
  },
  "dependencies": {
    "@monorepo/music-core-synthesizer-envelopes-contracts": "workspace:*",
    "@monorepo/music-core-synthesizer-oscillators-contracts": "workspace:*",
    "@monorepo/music-core-synthesizer-voice-contracts": "workspace:*"
  },
  "devDependencies": {
    "chai": "^5.1.2",
    "typescript": "~6.0.2",
    "vitest": "^3.2.4"
  }
}
'@

        "tsconfig.json" = $CommonTsConfig

        "src/VoiceDefinitionValidator.ts" = @'
import type {
  IVoiceDefinition,
  IVoiceLayerDefinition,
} from "@monorepo/music-core-synthesizer-voice-contracts";

export interface IVoiceDefinitionValidator {
  validate(definition: IVoiceDefinition): void;
}

export class VoiceDefinitionValidator implements IVoiceDefinitionValidator {
  public validate(definition: IVoiceDefinition): void {
    this.assertUnitInterval("outputGain", definition.outputGain);

    if (definition.layers.length === 0) {
      throw new Error("Voice definition requires at least one layer.");
    }

    definition.layers.forEach((layer, index) => this.validateLayer(layer, index));
  }

  private validateLayer(
    layer: IVoiceLayerDefinition,
    index: number,
  ): void {
    this.assertUnitInterval(`layers[${index}].gain`, layer.gain);

    if (typeof layer.enabled !== "boolean") {
      throw new Error(`layers[${index}].enabled must be boolean.`);
    }
  }

  private assertUnitInterval(
    name: string,
    value: number,
  ): void {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`${name} must be between 0 and 1. Actual value: ${String(value)}.`);
    }
  }
}
'@

        "src/DefaultVoiceDefinitionFactory.ts" = @'
import {
  EnvelopeCurveKind,
  EnvelopeKind,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";
import type {
  IAdsrEnvelopeDefinition,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";
import {
  OscillatorKind,
  OscillatorWaveformKind,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";
import type {
  IBasicOscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";
import type {
  IVoiceDefinition,
  IVoiceLayerDefinition,
} from "@monorepo/music-core-synthesizer-voice-contracts";

export class DefaultVoiceDefinitionFactory {
  public static createTwoLayerDefault(): IVoiceDefinition {
    return {
      outputGain: 0.75,
      layers: [
        this.createLayer({
          waveform: OscillatorWaveformKind.Sawtooth,
          oscillatorGain: 0.45,
          detuneCents: -7,
          layerGain: 0.9,
        }),
        this.createLayer({
          waveform: OscillatorWaveformKind.Square,
          oscillatorGain: 0.35,
          detuneCents: 7,
          layerGain: 0.8,
        }),
      ],
    };
  }

  private static createLayer(request: {
    readonly waveform: IBasicOscillatorDefinition["waveform"];
    readonly oscillatorGain: number;
    readonly detuneCents: number;
    readonly layerGain: number;
  }): IVoiceLayerDefinition {
    return {
      enabled: true,
      gain: request.layerGain,
      oscillator: this.createOscillator({
        waveform: request.waveform,
        gain: request.oscillatorGain,
        detuneCents: request.detuneCents,
      }),
      envelope: this.createAdsrEnvelope(),
    };
  }

  private static createOscillator(request: {
    readonly waveform: IBasicOscillatorDefinition["waveform"];
    readonly gain: number;
    readonly detuneCents: number;
  }): IBasicOscillatorDefinition {
    return {
      kind: OscillatorKind.Basic,
      waveform: request.waveform,
      frequencyHz: 440,
      detuneCents: request.detuneCents,
      phaseRadians: 0,
      gain: request.gain,
    };
  }

  private static createAdsrEnvelope(): IAdsrEnvelopeDefinition {
    return {
      kind: EnvelopeKind.Adsr,
      attackSeconds: 0.02,
      decaySeconds: 0.14,
      sustainLevel: 0.62,
      releaseSeconds: 0.35,
      attackCurve: { kind: EnvelopeCurveKind.Linear },
      decayCurve: { kind: EnvelopeCurveKind.Linear },
      releaseCurve: { kind: EnvelopeCurveKind.Linear },
    };
  }
}
'@

        "src/index.ts" = @'
export * from "./DefaultVoiceDefinitionFactory.js";
export * from "./VoiceDefinitionValidator.js";
'@

        "src/code.ts" = @'
export * from "./index.js";
'@

        "tests/VoiceDefinitionValidator.test.ts" = @'
import { should } from "chai";
import { describe, it } from "vitest";

import {
  DefaultVoiceDefinitionFactory,
  VoiceDefinitionValidator,
} from "../src/index.js";

should();

describe("VoiceDefinitionValidator", () => {
  it("should accept the default two-layer voice", () => {
    const validator = new VoiceDefinitionValidator();

    validator.validate(DefaultVoiceDefinitionFactory.createTwoLayerDefault());
  });

  it("should reject invalid output gain", () => {
    const validator = new VoiceDefinitionValidator();
    const definition = {
      ...DefaultVoiceDefinitionFactory.createTwoLayerDefault(),
      outputGain: 2,
    };

    (() => validator.validate(definition)).should.throw("outputGain must be between 0 and 1");
  });
});
'@
    }

# ---------------------------------------------------------------------------
# 3. music-core-synthesizer-voice-web-audio
# ---------------------------------------------------------------------------

Write-Package `
    -PackageName "music-core-synthesizer-voice-web-audio" `
    -Files @{
        "package.json" = @'
{
  "name": "@monorepo/music-core-synthesizer-voice-web-audio",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run"
  },
  "dependencies": {
    "@monorepo/music-core-synthesizer-envelopes-contracts": "workspace:*",
    "@monorepo/music-core-synthesizer-envelopes-web-audio": "workspace:*",
    "@monorepo/music-core-synthesizer-oscillators-web-audio": "workspace:*",
    "@monorepo/music-core-synthesizer-voice": "workspace:*",
    "@monorepo/music-core-synthesizer-voice-contracts": "workspace:*"
  },
  "devDependencies": {
    "chai": "^5.1.2",
    "typescript": "~6.0.2",
    "vitest": "^3.2.4"
  }
}
'@

        "tsconfig.json" = $CommonTsConfig

        "src/WebAudioVoice.ts" = @'
import type { EnvelopeDefinition } from "@monorepo/music-core-synthesizer-envelopes-contracts";
import { EnvelopeKind } from "@monorepo/music-core-synthesizer-envelopes-contracts";
import type {
  IWebAudioConnectable as IEnvelopeWebAudioConnectable,
  IWebAudioEnvelopeGainGraph,
  IWebAudioEnvelopeGainGraphFactory,
} from "@monorepo/music-core-synthesizer-envelopes-web-audio";
import type {
  IWebAudioConnectable as IOscillatorWebAudioConnectable,
  IWebAudioOscillatorGraph,
  IWebAudioOscillatorGraphFactory,
} from "@monorepo/music-core-synthesizer-oscillators-web-audio";
import type { IVoiceDefinitionValidator } from "@monorepo/music-core-synthesizer-voice";
import type {
  IVoiceDefinition,
  IVoiceGateOffRequest,
  IVoiceGateOnRequest,
} from "@monorepo/music-core-synthesizer-voice-contracts";

export interface IWebAudioVoiceContextLike {
  readonly currentTime: number;

  createGain(): GainNode;
}

export interface IWebAudioVoiceCreateRequest {
  readonly definition: IVoiceDefinition;
  readonly destination: AudioNode;
}

export interface IWebAudioVoice {
  gateOn(request: IVoiceGateOnRequest): void;

  gateOff(request: IVoiceGateOffRequest): void;

  dispose(): void;
}

export interface IWebAudioVoiceFactory {
  create(request: IWebAudioVoiceCreateRequest): IWebAudioVoice;
}

interface IWebAudioVoiceLayer {
  readonly oscillatorGraph: IWebAudioOscillatorGraph;
  readonly envelopeGraph: IWebAudioEnvelopeGainGraph;
  readonly layerGainNode: GainNode;
  readonly envelope: EnvelopeDefinition;
}

export class WebAudioVoiceFactory implements IWebAudioVoiceFactory {
  public constructor(
    private readonly context: IWebAudioVoiceContextLike,
    private readonly oscillatorGraphFactory: IWebAudioOscillatorGraphFactory,
    private readonly envelopeGraphFactory: IWebAudioEnvelopeGainGraphFactory,
    private readonly definitionValidator: IVoiceDefinitionValidator,
  ) {}

  public create(request: IWebAudioVoiceCreateRequest): IWebAudioVoice {
    this.definitionValidator.validate(request.definition);

    const outputGainNode = this.context.createGain();
    outputGainNode.gain.setValueAtTime(
      request.definition.outputGain,
      this.context.currentTime,
    );
    outputGainNode.connect(request.destination);

    const layers = request.definition.layers
      .filter((layer) => layer.enabled)
      .map((layer): IWebAudioVoiceLayer => {
        const oscillatorGraph = this.oscillatorGraphFactory.create(layer.oscillator);
        const envelopeGraph = this.envelopeGraphFactory.create(layer.envelope);
        const layerGainNode = this.context.createGain();

        layerGainNode.gain.setValueAtTime(layer.gain, this.context.currentTime);

        oscillatorGraph.connect(
          envelopeGraph.inputNode as unknown as IOscillatorWebAudioConnectable,
        );

        envelopeGraph.connect(
          layerGainNode as unknown as IEnvelopeWebAudioConnectable,
        );

        layerGainNode.connect(outputGainNode);

        return {
          oscillatorGraph,
          envelopeGraph,
          layerGainNode,
          envelope: layer.envelope,
        };
      });

    return new WebAudioVoice(this.context, layers, outputGainNode);
  }
}

class WebAudioVoice implements IWebAudioVoice {
  private disposeTimer: ReturnType<typeof globalThis.setTimeout> | null = null;
  private isDisposed = false;
  private isGateOpen = false;

  public constructor(
    private readonly context: IWebAudioVoiceContextLike,
    private readonly layers: readonly IWebAudioVoiceLayer[],
    private readonly outputGainNode: GainNode,
  ) {}

  public gateOn(request: IVoiceGateOnRequest): void {
    this.throwIfDisposed();
    this.clearDisposeTimer();

    this.assertTime(request.timeSeconds);
    this.assertFrequency(request.frequencyHz);
    this.assertVelocity(request.velocity);

    for (const layer of this.layers) {
      layer.envelopeGraph.gateOn({
        timeSeconds: request.timeSeconds,
        velocity: request.velocity,
      });

      layer.oscillatorGraph.noteOn({
        timeSeconds: request.timeSeconds,
        frequencyHz: request.frequencyHz,
        velocity: 1,
      });
    }

    this.isGateOpen = true;
  }

  public gateOff(request: IVoiceGateOffRequest): void {
    if (this.isDisposed || !this.isGateOpen) {
      return;
    }

    this.assertTime(request.timeSeconds);

    let latestStopTimeSeconds = request.timeSeconds;

    for (const layer of this.layers) {
      layer.envelopeGraph.gateOff({
        timeSeconds: request.timeSeconds,
      });

      const stopTimeSeconds =
        request.timeSeconds + EnvelopeReleaseSeconds.resolve(layer.envelope) + 0.02;

      layer.oscillatorGraph.noteOff({
        timeSeconds: stopTimeSeconds,
      });

      latestStopTimeSeconds = Math.max(latestStopTimeSeconds, stopTimeSeconds);
    }

    this.isGateOpen = false;
    this.scheduleDispose(latestStopTimeSeconds);
  }

  public dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.clearDisposeTimer();
    this.isDisposed = true;

    for (const layer of this.layers) {
      layer.oscillatorGraph.disconnect();
      layer.envelopeGraph.disconnect();
      layer.layerGainNode.disconnect();
    }

    this.outputGainNode.disconnect();
  }

  private scheduleDispose(stopTimeSeconds: number): void {
    const delayMilliseconds = Math.max(
      0,
      Math.ceil((stopTimeSeconds - this.context.currentTime) * 1000),
    );

    this.disposeTimer = globalThis.setTimeout(
      () => this.dispose(),
      delayMilliseconds + 20,
    );
  }

  private clearDisposeTimer(): void {
    if (this.disposeTimer === null) {
      return;
    }

    globalThis.clearTimeout(this.disposeTimer);
    this.disposeTimer = null;
  }

  private throwIfDisposed(): void {
    if (this.isDisposed) {
      throw new Error("Voice has already been disposed.");
    }
  }

  private assertTime(value: number): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`timeSeconds must be finite and >= 0. Actual value: ${String(value)}.`);
    }
  }

  private assertFrequency(value: number): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`frequencyHz must be finite and > 0. Actual value: ${String(value)}.`);
    }
  }

  private assertVelocity(value: number): void {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`velocity must be between 0 and 1. Actual value: ${String(value)}.`);
    }
  }
}

class EnvelopeReleaseSeconds {
  public static resolve(definition: EnvelopeDefinition): number {
    switch (definition.kind) {
      case EnvelopeKind.Adsr:
      case EnvelopeKind.Ahdsr:
      case EnvelopeKind.Ar:
      case EnvelopeKind.Asr:
        return definition.releaseSeconds;

      case EnvelopeKind.OneShot:
        return 0;
    }
  }
}
'@

        "src/index.ts" = @'
export * from "./WebAudioVoice.js";
'@

        "src/code.ts" = @'
export * from "./index.js";
'@

        "tests/WebAudioVoice.test.ts" = @'
import { should } from "chai";
import { describe, it } from "vitest";

import { DefaultVoiceDefinitionFactory, VoiceDefinitionValidator } from "@monorepo/music-core-synthesizer-voice";

import { WebAudioVoiceFactory } from "../src/index.js";

should();

describe("WebAudioVoiceFactory", () => {
  it("should create one oscillator and one envelope graph per enabled layer", () => {
    const context = new FakeAudioContext();
    const oscillatorFactory = new FakeOscillatorGraphFactory();
    const envelopeFactory = new FakeEnvelopeGraphFactory();

    const factory = new WebAudioVoiceFactory(
      context as never,
      oscillatorFactory as never,
      envelopeFactory as never,
      new VoiceDefinitionValidator(),
    );

    const voice = factory.create({
      definition: DefaultVoiceDefinitionFactory.createTwoLayerDefault(),
      destination: new FakeGainNode() as never,
    });

    voice.gateOn({
      timeSeconds: 1,
      frequencyHz: 261.6255653005986,
      velocity: 0.85,
    });

    oscillatorFactory.graphs.length.should.equal(2);
    envelopeFactory.graphs.length.should.equal(2);
    oscillatorFactory.graphs[0]?.noteOnCount.should.equal(1);
    envelopeFactory.graphs[0]?.gateOnCount.should.equal(1);
  });
});

class FakeAudioContext {
  public readonly currentTime = 0;

  public createGain(): FakeGainNode {
    return new FakeGainNode();
  }
}

class FakeGainNode {
  public readonly gain = {
    setValueAtTime: (_value: number, _time: number): void => {},
  };

  public connect(_destination: unknown): void {}

  public disconnect(): void {}
}

class FakeOscillatorGraphFactory {
  public readonly graphs: FakeOscillatorGraph[] = [];

  public create(_definition: unknown): FakeOscillatorGraph {
    const graph = new FakeOscillatorGraph();
    this.graphs.push(graph);
    return graph;
  }
}

class FakeOscillatorGraph {
  public noteOnCount = 0;

  public connect(_destination: unknown): void {}

  public noteOn(_request: unknown): void {
    this.noteOnCount++;
  }

  public noteOff(_request: unknown): void {}

  public disconnect(): void {}
}

class FakeEnvelopeGraphFactory {
  public readonly graphs: FakeEnvelopeGraph[] = [];

  public create(_definition: unknown): FakeEnvelopeGraph {
    const graph = new FakeEnvelopeGraph();
    this.graphs.push(graph);
    return graph;
  }
}

class FakeEnvelopeGraph {
  public readonly inputNode = new FakeGainNode();
  public gateOnCount = 0;

  public connect(_destination: unknown): void {}

  public gateOn(_request: unknown): void {
    this.gateOnCount++;
  }

  public gateOff(_request: unknown): void {}

  public disconnect(): void {}
}
'@
    }

# ---------------------------------------------------------------------------
# 4. music-core-synthesizer-voice-ui
# ---------------------------------------------------------------------------

Write-Package `
    -PackageName "music-core-synthesizer-voice-ui" `
    -Files @{
        "package.json" = @'
{
  "name": "@monorepo/music-core-synthesizer-voice-ui",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run"
  },
  "dependencies": {
    "@monorepo/music-core-synthesizer-voice-contracts": "workspace:*",
    "lit": "^3.3.2"
  },
  "devDependencies": {
    "chai": "^5.1.2",
    "jsdom": "^27.0.0",
    "typescript": "~6.0.2",
    "vitest": "^3.2.4"
  }
}
'@

        "tsconfig.json" = $CommonTsConfig

        "src/voice-control.component.ts" = @'
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-voice-contracts";

export const VoiceControlEvent = {
  DefinitionChanged: "voice-control-definition-changed",
} as const;

export interface IVoiceDefinitionChangedDetail {
  readonly definition: IVoiceDefinition;
}

@customElement("voice-control")
export class VoiceControlComponent extends LitElement {
  @property({ attribute: false })
  public definition: IVoiceDefinition | null = null;

  public static override readonly styles = css`
    :host {
      display: grid;
      gap: 12px;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
      font-family: system-ui, sans-serif;
    }

    .row {
      display: grid;
      gap: 6px;
    }

    label {
      font-size: 13px;
      font-weight: 600;
    }

    input {
      width: 100%;
    }
  `;

  protected override render() {
    if (this.definition === null) {
      return html`<p>No voice definition.</p>`;
    }

    return html`
      <section>
        <h2>Voice</h2>

        <div class="row">
          <label for="outputGain">
            Output gain: ${this.definition.outputGain.toFixed(2)}
          </label>
          <input
            id="outputGain"
            type="range"
            min="0"
            max="1"
            step="0.01"
            .value=${String(this.definition.outputGain)}
            @input=${this.onOutputGainChanged}
          />
        </div>

        <p>Layers: ${this.definition.layers.length}</p>

        <slot name="layers"></slot>
      </section>
    `;
  }

  private readonly onOutputGainChanged = (event: Event): void => {
    if (this.definition === null) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const outputGain = Number(input.value);

    if (!Number.isFinite(outputGain)) {
      return;
    }

    this.definition = {
      ...this.definition,
      outputGain,
    };

    this.dispatchEvent(
      new CustomEvent<IVoiceDefinitionChangedDetail>(
        VoiceControlEvent.DefinitionChanged,
        {
          bubbles: true,
          composed: true,
          detail: {
            definition: this.definition,
          },
        },
      ),
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "voice-control": VoiceControlComponent;
  }
}
'@

        "src/index.ts" = @'
export * from "./voice-control.component.js";
'@

        "src/code.ts" = @'
export * from "./index.js";
'@

        "tests/voice-control.component.test.ts" = @'
// @vitest-environment jsdom

import { should } from "chai";
import { afterEach, beforeEach, describe, it } from "vitest";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-voice-contracts";

import {
  VoiceControlEvent,
  type IVoiceDefinitionChangedDetail,
} from "../src/index.js";
import "../src/index.js";

should();

type VoiceControlElement = HTMLElement & {
  definition: IVoiceDefinition | null;
  updateComplete: Promise<boolean>;
};

describe("VoiceControlComponent", () => {
  let fixture: VoiceControlFixture;

  beforeEach(() => {
    fixture = new VoiceControlFixture();
  });

  afterEach(() => {
    fixture.dispose();
  });

  it("should render fallback without a voice definition", async () => {
    const element = await fixture.create(null);

    element.shadowRoot?.textContent?.should.contain("No voice definition.");
  });

  it("should dispatch definition changed when output gain changes", async () => {
    const element = await fixture.create({
      layers: [],
      outputGain: 0.5,
    });

    const recorder = new EventRecorder<IVoiceDefinitionChangedDetail>(
      element,
      VoiceControlEvent.DefinitionChanged,
    );

    const input = fixture.requiredShadowElement<HTMLInputElement>("input#outputGain");
    input.value = "0.73";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    await element.updateComplete;

    recorder.events.length.should.equal(1);
    recorder.last().definition.outputGain.should.equal(0.73);
  });
});

class VoiceControlFixture {
  private element: VoiceControlElement | null = null;

  public async create(
    definition: IVoiceDefinition | null,
  ): Promise<VoiceControlElement> {
    const element = document.createElement("voice-control") as VoiceControlElement;
    element.definition = definition;

    document.body.appendChild(element);
    await element.updateComplete;

    this.element = element;
    return element;
  }

  public requiredShadowElement<TElement extends Element>(
    selector: string,
  ): TElement {
    if (this.element === null) {
      throw new Error("Fixture element has not been created.");
    }

    const found = this.element.shadowRoot?.querySelector(selector);

    if (found === null || found === undefined) {
      throw new Error(`Expected shadow element was not found: ${selector}`);
    }

    return found as TElement;
  }

  public dispose(): void {
    this.element?.remove();
    document.body.innerHTML = "";
    this.element = null;
  }
}

class EventRecorder<TDetail> {
  public readonly events: TDetail[] = [];

  public constructor(
    target: EventTarget,
    eventName: string,
  ) {
    target.addEventListener(eventName, (event) => {
      this.events.push((event as CustomEvent<TDetail>).detail);
    });
  }

  public last(): TDetail {
    const last = this.events.at(-1);

    if (last === undefined) {
      throw new Error("No events were recorded.");
    }

    return last;
  }
}
'@
    }

Write-Host ""
Write-Host "Done."
Write-Host ""
Write-Host "Next commands:"
Write-Host "  pnpm install"
Write-Host "  pnpm --filter @monorepo/music-core-synthesizer-voice-contracts build"
Write-Host "  pnpm --filter @monorepo/music-core-synthesizer-voice build"
Write-Host "  pnpm --filter @monorepo/music-core-synthesizer-voice-web-audio build"
Write-Host "  pnpm --filter @monorepo/music-core-synthesizer-voice-ui build"
Write-Host ""
Write-Host "Optional tests:"
Write-Host "  pnpm --filter @monorepo/music-core-synthesizer-voice-contracts test"
Write-Host "  pnpm --filter @monorepo/music-core-synthesizer-voice test"
Write-Host "  pnpm --filter @monorepo/music-core-synthesizer-voice-web-audio test"
Write-Host "  pnpm --filter @monorepo/music-core-synthesizer-voice-ui test"