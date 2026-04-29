 
# FILE: fix-module-basic-and-midi-ui.ps1

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$RepoRoot = "C:\Users\danha\source\repos\HTML\MonoRepro",

    [Parameter(Mandatory = $false)]
    [switch]$RunBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"

$ModuleBasicRoot = Join-Path $RepoRoot "packages\Audio\project-x-ray-sound-magic\test-playground\modules-basic-tester"
$MidiUiRoot = Join-Path $RepoRoot "packages\Audio\project-x-ray-sound-magic\music-core-synthesizer\functional-modules\midi-streamer\audio-function-midi-streamer-ui"

function Assert-Directory {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        throw "Directory not found: $Path"
    }
}

function Backup-File {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        Copy-Item -LiteralPath $Path -Destination "$Path.bak.$Stamp" -Force
    }
}

function Write-SourceFile {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )

    $directory = Split-Path -Parent $Path

    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }

    $normalized = $Content.TrimEnd() + [Environment]::NewLine

    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        $current = Get-Content -LiteralPath $Path -Raw

        if ($current -eq $normalized) {
            Write-Host "Unchanged: $Path"
            return
        }

        Backup-File -Path $Path
    }

    [System.IO.File]::WriteAllText($Path, $normalized, $Utf8NoBom)
    Write-Host "Written:   $Path"
}

Assert-Directory -Path $RepoRoot
Assert-Directory -Path $ModuleBasicRoot
Assert-Directory -Path $MidiUiRoot

Write-SourceFile `
    -Path (Join-Path $ModuleBasicRoot "src\infrastructure\NavigationEvents.ts") `
    -Content @'
export const NavigationEvents = {
  ViewChange: "view-change",
} as const;

export type NavigationEventName =
  (typeof NavigationEvents)[keyof typeof NavigationEvents];

export interface ViewChangeDetail {
  readonly view: string;
}

export type ViewChangeEvent = CustomEvent<ViewChangeDetail>;
'@

Write-SourceFile `
    -Path (Join-Path $ModuleBasicRoot "src\infrastructure\Style.ts") `
    -Content @'
import { css, type CSSResult } from "lit";

export class Style {
  public static readonly appShell: CSSResult = css`
    :host {
      display: grid;
      grid-template-columns: 15% 85%;
      min-height: 100vh;
      font-family: system-ui, sans-serif;
      color: #f4f4f5;
      background: #0f1117;
    }

    .navigation-column {
      min-height: 100vh;
      padding: 1rem;
      border-right: 1px solid #2a2f3a;
      background: #11141b;
    }

    .view-column {
      min-height: 100vh;
      padding: 1rem;
      overflow: auto;
    }
  `;

  public static readonly navMenu: CSSResult = css`
    :host {
      display: block;
    }

    nav {
      display: grid;
      gap: 0.5rem;
    }
  `;

  public static readonly navMenuItem: CSSResult = css`
    :host {
      display: block;
    }

    button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0.75rem 1rem;
      border: 1px solid #2a2f3a;
      border-radius: 0.5rem;
      background: #171a22;
      color: #f4f4f5;
      font: inherit;
      cursor: pointer;
      text-align: left;
    }

    button:hover {
      background: #202532;
    }

    button.active,
    button[aria-current="page"] {
      border-color: #6ea8fe;
      background: #1f2a44;
    }
  `;

  public static installGlobal(): void {
    if (document.getElementById("module-basic-global-style") !== null) {
      return;
    }

    const style = document.createElement("style");
    style.id = "module-basic-global-style";
    style.textContent = `
      html,
      body {
        margin: 0;
        min-height: 100%;
        background: #0f1117;
        color: #f4f4f5;
      }

      * {
        box-sizing: border-box;
      }
    `;

    document.head.appendChild(style);
  }
}
'@

Write-SourceFile `
    -Path (Join-Path $ModuleBasicRoot "src\features\navigationFeature\NavMenuItem.ts") `
    -Content @'
import { LitElement, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { NavigationEvents } from "../../infrastructure/NavigationEvents.js";
import { Style } from "../../infrastructure/Style.js";

export interface NavMenuItemSelectedDetail {
  readonly view: string;
}

@customElement("nav-menu-item")
export class NavMenuItem extends LitElement {
  public static override readonly styles = Style.navMenuItem;

  @property({ type: String, attribute: "view-id" })
  public viewId = "";

  @property({ type: Boolean, reflect: true })
  public selected = false;

  @property({ attribute: false })
  public template: TemplateResult = html``;

  public override render(): TemplateResult {
    return html`
      <button
        type="button"
        class=${this.selected ? "active" : ""}
        aria-current=${this.selected ? "page" : "false"}
        @click=${this.handleClick}
      >
        ${this.template}
      </button>
    `;
  }

  private readonly handleClick = (): void => {
    const view = this.viewId.trim();

    if (view.length === 0) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<NavMenuItemSelectedDetail>(NavigationEvents.ViewChange, {
        detail: { view },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "nav-menu-item": NavMenuItem;
  }
}
'@

Write-SourceFile `
    -Path (Join-Path $ModuleBasicRoot "src\features\navigationFeature\NavMenu.ts") `
    -Content @'
import { LitElement, html, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { Style } from "../../infrastructure/Style.js";

@customElement("nav-menu")
export class NavMenu extends LitElement {
  public static override readonly styles = Style.navMenu;

  public override render(): TemplateResult {
    return html`
      <nav aria-label="Application views">
        <slot></slot>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "nav-menu": NavMenu;
  }
}
'@

Write-SourceFile `
    -Path (Join-Path $ModuleBasicRoot "src\infrastructure\ViewFeatureCatalog.ts") `
    -Content @'
import type { IViewFeature } from "./IViewFeature.js";

import { AboutFeature } from "../features/aboutFeature/aboutFeature.js";
import { FooFooFeature } from "../features/fooFooFeature/fooFooFeature.js";
import { HomeFeature } from "../features/homeFeature/homeFeature.js";
import { MultiOscillatorsFeature } from "../features/multiOscillatorsFeature/multiOscillatorsFeature.js";
import { SoundTestFeature } from "../features/soundTestFeature/soundTestFeature.js";

export class ViewFeatureCatalog {
  private readonly featuresById: ReadonlyMap<string, IViewFeature>;

  public constructor(private readonly registeredFeatures: readonly IViewFeature[]) {
    this.featuresById = new Map(
      registeredFeatures.map((feature) => [feature.id, feature]),
    );
  }

  public get defaultFeature(): IViewFeature {
    const firstFeature = this.registeredFeatures[0];

    if (firstFeature === undefined) {
      throw new Error("At least one view feature must be registered.");
    }

    return firstFeature;
  }

  public get features(): readonly IViewFeature[] {
    return this.registeredFeatures;
  }

  public findById(id: string): IViewFeature | undefined {
    return this.featuresById.get(id);
  }
}

export class ViewFeatureCatalogFactory {
  public create(): ViewFeatureCatalog {
    return new ViewFeatureCatalog([
      new HomeFeature(),
      new AboutFeature(),
      new SoundTestFeature(),
      new FooFooFeature(),
      new MultiOscillatorsFeature(),
    ]);
  }
}

export function createViewFeatureCatalog(): ViewFeatureCatalog {
  return new ViewFeatureCatalogFactory().create();
}
'@

Write-SourceFile `
    -Path (Join-Path $ModuleBasicRoot "src\multi-view-app.ts") `
    -Content @'
import { LitElement, html, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

import "./custom-elements.js";
import "./features/navigationFeature/NavMenu.js";
import "./features/navigationFeature/NavMenuItem.js";

import type { IViewFeature } from "./infrastructure/IViewFeature.js";
import type { ViewChangeDetail } from "./infrastructure/NavigationEvents.js";
import { NavigationEvents } from "./infrastructure/NavigationEvents.js";
import { Style } from "./infrastructure/Style.js";
import { createViewFeatureCatalog } from "./infrastructure/ViewFeatureCatalog.js";

const featureCatalog = createViewFeatureCatalog();

@customElement("multi-view-app")
export class MultiViewApp extends LitElement {
  public static override readonly styles = Style.appShell;

  @state()
  private selectedFeature: IViewFeature = featureCatalog.defaultFeature;

  @state()
  private selectedViewHtml = "";

  public override connectedCallback(): void {
    super.connectedCallback();

    Style.installGlobal();

    this.addEventListener(
      NavigationEvents.ViewChange,
      this.handleViewChange as EventListener,
    );

    void this.loadFeature(this.selectedFeature);
  }

  public override disconnectedCallback(): void {
    this.removeEventListener(
      NavigationEvents.ViewChange,
      this.handleViewChange as EventListener,
    );

    super.disconnectedCallback();
  }

  public override render(): TemplateResult {
    return html`
      <aside class="navigation-column">
        <nav-menu>
          ${featureCatalog.features.map(
            (feature) => html`
              <nav-menu-item
                .viewId=${feature.id}
                .selected=${this.selectedFeature.id === feature.id}
                .template=${feature.renderNavigationTemplate()}
              ></nav-menu-item>
            `,
          )}
        </nav-menu>
      </aside>

      <main class="view-column">
        ${unsafeHTML(this.selectedViewHtml)}
      </main>
    `;
  }

  private readonly handleViewChange = (
    event: CustomEvent<ViewChangeDetail>,
  ): void => {
    const feature = featureCatalog.findById(event.detail.view);

    if (feature === undefined) {
      this.selectedViewHtml = `<h1>Unknown view</h1><p>${event.detail.view}</p>`;
      return;
    }

    void this.loadFeature(feature);
  };

  private async loadFeature(feature: IViewFeature): Promise<void> {
    this.selectedFeature = feature;

    try {
      this.selectedViewHtml = await feature.loadViewHtml();
    } catch {
      this.selectedViewHtml = `<h1>Load error</h1><p>${feature.id}</p>`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "multi-view-app": MultiViewApp;
  }
}
'@

Write-SourceFile `
    -Path (Join-Path $ModuleBasicRoot "src\features\index.ts") `
    -Content @'
export * from "./aboutFeature/aboutFeature.js";
export * from "./fooFooFeature/fooFooFeature.js";
export * from "./homeFeature/homeFeature.js";
export * from "./multiOscillatorsFeature/multiOscillatorsFeature.js";
export * from "./soundTestFeature/soundTestFeature.js";
'@

Write-SourceFile `
    -Path (Join-Path $ModuleBasicRoot "src\features\soundTestFeature\two-oscillator-demo.component.ts") `
    -Content @'
import {
  DefaultMidiSongCatalogFactory,
  MidiSongStreamerFactory,
} from "@monorepo/audio-function-midi-streamer";
import {
  MidiMessageKinds,
  type MidiMessage,
  type MidiSong,
  type MidiStreamFailure,
  type MidiStreamMessage,
} from "@monorepo/audio-function-midi-streamer-contracts";
import type { OscillatorDefinition } from "@monorepo/music-core-synthesizer-oscillators-contracts";
import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

import {
  SoundController,
  type OscillatorIndex,
} from "./SoundController.js";

type OscillatorDefinitionChangedEvent = CustomEvent<{
  readonly definition: OscillatorDefinition;
}>;

type MidiStreamMessageEvent = CustomEvent<MidiStreamMessage>;
type MidiStreamFailureEvent = CustomEvent<MidiStreamFailure>;

@customElement("two-oscillator-demo")
export class TwoOscillatorDemoComponent extends LitElement {
  private static readonly midiSongCatalogUrl = new URL(
    "../../../../../music-core-synthesizer/functional-modules/midi-streamer/sample-songs/midi-songs.json",
    import.meta.url,
  ).href;

  private readonly soundController = new SoundController();

  private readonly midiStreamer =
    new MidiSongStreamerFactory().createBrowserDefault();

  private readonly songCatalogFactory = new DefaultMidiSongCatalogFactory();

  @state()
  private status = "Ready";

  @state()
  private songs: readonly MidiSong[] = [];

  @state()
  private oscillatorADefinition =
    this.soundController.getOscillatorDefinition(0);

  @state()
  private oscillatorBDefinition =
    this.soundController.getOscillatorDefinition(1);

  public static override readonly styles = css`
    :host {
      display: block;
    }

    .layout {
      display: grid;
      gap: 16px;
    }

    .toolbar,
    .controls {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: flex-start;
    }

    button {
      padding: 8px 12px;
      font: inherit;
      cursor: pointer;
    }

    .status {
      padding: 8px 12px;
      border: 1px solid #333;
      border-radius: 8px;
      font-size: 13px;
    }

    audio-function-midi-streamer {
      display: block;
      min-width: 320px;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
    }
  `;

  public override connectedCallback(): void {
    super.connectedCallback();
    void this.loadMidiSongs();
  }

  public override disconnectedCallback(): void {
    this.soundController.noteOff();
    super.disconnectedCallback();
  }

  public override render(): TemplateResult {
    return html`
      <section class="layout">
        <h1>Oscillator View</h1>

        <div class="toolbar">
          <button type="button" @click=${this.playC4}>Play C4</button>
          <button type="button" @click=${this.stop}>Stop</button>
        </div>

        <div class="status">${this.status}</div>

        <div class="controls">
          <oscillator-control
            label="Oscillator A"
            .definition=${this.oscillatorADefinition}
            @oscillator-control-definition-changed=${(
              event: OscillatorDefinitionChangedEvent,
            ) => this.onOscillatorDefinitionChanged(0, event)}
          ></oscillator-control>

          <oscillator-control
            label="Oscillator B"
            .definition=${this.oscillatorBDefinition}
            @oscillator-control-definition-changed=${(
              event: OscillatorDefinitionChangedEvent,
            ) => this.onOscillatorDefinitionChanged(1, event)}
          ></oscillator-control>

          <audio-function-midi-streamer
            .streamer=${this.midiStreamer}
            .songs=${this.songs}
            @audio-function-midi-streamer:song-selected=${this.onMidiSongSelected}
            @audio-function-midi-streamer:midi-message=${this.onMidiMessage}
            @audio-function-midi-streamer:stream-completed=${this.onMidiCompleted}
            @audio-function-midi-streamer:stream-failed=${this.onMidiFailed}
          ></audio-function-midi-streamer>
        </div>
      </section>
    `;
  }

  private async loadMidiSongs(): Promise<void> {
    try {
      this.status = "Loading MIDI songs...";

      const response = await fetch(TwoOscillatorDemoComponent.midiSongCatalogUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to load MIDI song catalog. HTTP status: ${response.status}.`,
        );
      }

      const json = (await response.json()) as unknown;
      const repository = this.songCatalogFactory.createFromJson(json);

      this.songs = await repository.list();
      this.status = `Loaded ${this.songs.length} MIDI song(s)`;
    } catch (error) {
      this.songs = [];
      this.status = `MIDI song load failed: ${this.getErrorMessage(error)}`;
    }
  }

  private readonly playC4 = async (): Promise<void> => {
    await this.soundController.init();
    this.soundController.noteOn(60, 0.85);
    this.status = "Playing C4 with two oscillators";
  };

  private readonly stop = (): void => {
    this.soundController.noteOff();
    this.status = "Stopped";
  };

  private onOscillatorDefinitionChanged(
    index: OscillatorIndex,
    event: OscillatorDefinitionChangedEvent,
  ): void {
    this.soundController.setOscillatorDefinition(index, event.detail.definition);

    if (index === 0) {
      this.oscillatorADefinition = event.detail.definition;
    } else {
      this.oscillatorBDefinition = event.detail.definition;
    }

    this.status = `Oscillator ${index === 0 ? "A" : "B"} changed`;
  }

  private readonly onMidiSongSelected = async (): Promise<void> => {
    await this.soundController.init();
    this.status = "MIDI song selected";
  };

  private readonly onMidiMessage = async (
    event: MidiStreamMessageEvent,
  ): Promise<void> => {
    await this.soundController.handleMidiMessage(event.detail.message);

    this.status =
      `MIDI ${event.detail.eventIndex + 1}: ${MidiMessageFormatter.format(
        event.detail.message,
      )}`;
  };

  private readonly onMidiCompleted = (): void => {
    this.soundController.noteOff();
    this.status = "MIDI completed";
  };

  private readonly onMidiFailed = (event: MidiStreamFailureEvent): void => {
    this.soundController.noteOff();
    this.status = `MIDI failed: ${event.detail.message}`;
  };

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return "Unknown error.";
  }
}

class MidiMessageFormatter {
  public static format(message: MidiMessage): string {
    switch (message.kind) {
      case MidiMessageKinds.noteOn:
        return `note-on ch=${message.channel} note=${message.note} velocity=${message.velocity}`;

      case MidiMessageKinds.noteOff:
        return `note-off ch=${message.channel} note=${message.note}`;

      case MidiMessageKinds.controlChange:
        return `cc ch=${message.channel} controller=${message.controller} value=${message.value}`;

      case MidiMessageKinds.pitchBend:
        return `pitch-bend ch=${message.channel} value=${message.value}`;

      case MidiMessageKinds.systemExclusive:
        return `sysex bytes=${message.data.length}`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "two-oscillator-demo": TwoOscillatorDemoComponent;
  }
}
'@

Write-SourceFile `
    -Path (Join-Path $MidiUiRoot "src\components\AudioFunctionMidiStreamerElement.ts") `
    -Content @'
import {
  MidiStreamerDomEvents,
  type IMidiSongStreamer,
  type MidiSong,
  type MidiStreamCompleted,
  type MidiStreamFailure,
  type MidiStreamMessage,
  type MidiStreamSubscription,
} from "@monorepo/audio-function-midi-streamer-contracts";
import { css, html, LitElement, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { DomMidiStreamSink } from "../internal/DomMidiStreamSink.js";

export const AudioFunctionMidiStreamerElementTagName =
  "audio-function-midi-streamer";

@customElement(AudioFunctionMidiStreamerElementTagName)
export class AudioFunctionMidiStreamerElement extends LitElement {
  public static override readonly styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      font-family: system-ui, sans-serif;
    }

    :host([disabled]) {
      opacity: 0.7;
    }

    .root {
      display: grid;
      gap: 0.75rem;
    }

    .field {
      display: grid;
      gap: 0.25rem;
    }

    label {
      font-size: 0.875rem;
      font-weight: 600;
    }

    select {
      min-height: 2rem;
      font: inherit;
    }

    .toolbar {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      align-items: center;
    }

    button {
      padding: 0.5rem 0.75rem;
      font: inherit;
      cursor: pointer;
    }

    button:disabled,
    select:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .status {
      font-size: 0.75rem;
      opacity: 0.8;
    }
  `;

  @property({ attribute: false })
  public songs: readonly MidiSong[] = [];

  @property({ attribute: false })
  public streamer: IMidiSongStreamer | null = null;

  @property({ type: Boolean, reflect: true })
  public disabled = false;

  @state()
  private selectedSongId = "";

  @state()
  private isPlaying = false;

  @state()
  private statusText = "No songs loaded";

  private currentSubscription: MidiStreamSubscription | null = null;

  public override disconnectedCallback(): void {
    this.stopCurrentStream(false);
    super.disconnectedCallback();
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("disabled") && this.disabled) {
      this.stopCurrentStream(true);
    }

    if (changedProperties.has("songs")) {
      this.syncSelectedSongBeforeUpdate();
    }
  }

  protected override render(): TemplateResult {
    const hasSongs = this.songs.length > 0;
    const canPlay = !this.disabled && !this.isPlaying && hasSongs;

    return html`
      <section class="root">
        <div class="field">
          <label for="song-selector">Song</label>

          <select
            id="song-selector"
            .value=${this.selectedSongId}
            ?disabled=${this.disabled || this.isPlaying || !hasSongs}
            @change=${this.handleSongChanged}
          >
            ${repeat(
              this.songs,
              (song) => song.id,
              (song) => html`
                <option value=${song.id}>${song.title}</option>
              `,
            )}
          </select>
        </div>

        <div class="toolbar">
          <button
            type="button"
            ?disabled=${!canPlay}
            @click=${this.playSelectedSong}
          >
            Play
          </button>

          <button
            type="button"
            ?disabled=${this.disabled || !this.isPlaying}
            @click=${this.stopByUser}
          >
            Stop
          </button>
        </div>

        <div class="status" role="status" aria-live="polite">
          ${this.statusText}
        </div>

        <slot name="midi-data"></slot>
      </section>
    `;
  }

  private syncSelectedSongBeforeUpdate(): void {
    if (this.songs.length === 0) {
      this.selectedSongId = "";
      this.statusText = "No songs loaded";
      return;
    }

    const selectedStillExists = this.songs.some(
      (song) => song.id === this.selectedSongId,
    );

    if (!selectedStillExists) {
      this.selectedSongId = this.songs[0]?.id ?? "";
    }

    if (!this.isPlaying) {
      this.statusText = `${this.songs.length} song(s) loaded`;
    }

    this.dispatchEvent(
      new CustomEvent(MidiStreamerDomEvents.songsLoaded, {
        bubbles: true,
        composed: true,
        detail: {
          count: this.songs.length,
        },
      }),
    );
  }

  private readonly handleSongChanged = (event: Event): void => {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    this.selectedSongId = target.value;

    const selectedSong = this.getSelectedSong();

    this.statusText =
      selectedSong === null
        ? `Selected song not found: ${target.value}`
        : `Selected: ${selectedSong.title}`;
  };

  private readonly playSelectedSong = (): void => {
    if (this.disabled || this.isPlaying) {
      return;
    }

    const song = this.getSelectedSong();

    if (song === null) {
      this.publishFailure(`Song not found: ${this.selectedSongId}`);
      return;
    }

    if (this.streamer === null) {
      this.publishFailure("No MIDI song streamer has been configured.");
      return;
    }

    this.stopCurrentStream(false);

    this.isPlaying = true;
    this.statusText = `Playing: ${song.title}`;

    this.dispatchEvent(
      new CustomEvent(MidiStreamerDomEvents.songSelected, {
        bubbles: true,
        composed: true,
        detail: {
          songId: song.id,
          title: song.title,
        },
      }),
    );

    this.currentSubscription = this.streamer.stream(
      song,
      new DomMidiStreamSink(this, {
        onMidiStreamMessage: (event) => this.onMidiStreamMessage(event),
        onMidiStreamCompleted: (event) => this.onMidiStreamCompleted(event),
        onMidiStreamFailed: (error) => this.onMidiStreamFailed(error),
      }),
    );
  };

  private readonly stopByUser = (): void => {
    this.stopCurrentStream(true);
  };

  private onMidiStreamMessage(event: MidiStreamMessage): void {
    this.statusText =
      `Playing event ${event.eventIndex + 1}/${this.getSelectedSong()?.events.length ?? "?"}`;
  }

  private onMidiStreamCompleted(_event: MidiStreamCompleted): void {
    this.currentSubscription = null;
    this.isPlaying = false;
    this.statusText = "Completed";
  }

  private onMidiStreamFailed(error: MidiStreamFailure): void {
    this.currentSubscription = null;
    this.isPlaying = false;
    this.statusText = `Failed: ${error.message}`;
  }

  private stopCurrentStream(updateStatus: boolean): void {
    if (this.currentSubscription !== null) {
      this.currentSubscription.cancel();
      this.currentSubscription = null;
    }

    this.isPlaying = false;

    if (updateStatus) {
      this.statusText = "Stopped";
    }
  }

  private getSelectedSong(): MidiSong | null {
    return this.songs.find((song) => song.id === this.selectedSongId) ?? null;
  }

  private publishFailure(message: string): void {
    this.stopCurrentStream(false);
    this.statusText = `Failed: ${message}`;

    this.dispatchEvent(
      new CustomEvent(MidiStreamerDomEvents.streamFailed, {
        bubbles: true,
        composed: true,
        detail: {
          songId: this.selectedSongId,
          message,
        },
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "audio-function-midi-streamer": AudioFunctionMidiStreamerElement;
  }
}
'@

Set-Location $RepoRoot

if ($RunBuild) {
    pnpm --filter @monorepo/audio-function-midi-streamer-ui build
    pnpm --filter module-basic build
}

Write-Host ""
Write-Host "Done."
Write-Host "Backups were written as *.bak.$Stamp"
Write-Host ""
Write-Host "Run:"
Write-Host "  pnpm --filter @monorepo/audio-function-midi-streamer-ui build"
Write-Host "  pnpm --filter module-basic build"
Write-Host "  pnpm --filter module-basic dev"
 