// FILE: tests/oscillator-control.component.test.ts

// @vitest-environment jsdom

import { should } from "chai";
import { afterEach, beforeEach, describe, it } from "vitest";

import type {
  IBasicOscillatorDefinition,
  OscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";
import {
  OscillatorKind,
  OscillatorWaveformKind,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import {
  OscillatorControlEvent,
  type IOscillatorDefinitionChangedDetail,
  type IOscillatorMidiNoteOffDetail,
  type IOscillatorMidiNoteOnDetail,
} from "../src/oscillator-control.component.js";
import "../src/oscillator-control.component.js";

should();

type OscillatorControlElement = HTMLElement & {
  definition: OscillatorDefinition | null;
  updateComplete: Promise<boolean>;
};

describe("OscillatorControlComponent", () => {
  let fixture: OscillatorControlComponentFixture;

  beforeEach(() => {
    fixture = new OscillatorControlComponentFixture();
  });

  afterEach(() => {
    fixture.dispose();
  });

  it("should render fallback when no oscillator definition is assigned", async () => {
    const element = await fixture.create();

    element.shadowRoot?.textContent?.should.contain("No oscillator definition.");
  });

  it("should render controls for a basic oscillator definition", async () => {
    const element = await fixture.create(TestOscillatorDefinitions.basic());

    element.shadowRoot?.textContent?.should.contain("Oscillator");
    element.shadowRoot?.textContent?.should.contain("Waveform");
    element.shadowRoot?.textContent?.should.contain("Gain: 0.50");
    element.shadowRoot?.textContent?.should.contain("Detune cents: 0");
  });

  it("should dispatch definition changed when waveform changes", async () => {
    const element = await fixture.create(TestOscillatorDefinitions.basic());
    const recorder = new EventRecorder<IOscillatorDefinitionChangedDetail>(
      element,
      OscillatorControlEvent.DefinitionChanged,
    );

    const select = fixture.requiredShadowElement<HTMLSelectElement>("select#waveform");
    select.value = OscillatorWaveformKind.Sawtooth;
    select.dispatchEvent(new Event("change", { bubbles: true }));

    await element.updateComplete;

    recorder.events.length.should.equal(1);

    const definition = recorder.last().definition;
    definition.kind.should.equal(OscillatorKind.Basic);
    (definition as IBasicOscillatorDefinition).waveform.should.equal(
      OscillatorWaveformKind.Sawtooth,
    );
  });

  it("should dispatch definition changed when gain changes", async () => {
    const element = await fixture.create(TestOscillatorDefinitions.basic());
    const recorder = new EventRecorder<IOscillatorDefinitionChangedDetail>(
      element,
      OscillatorControlEvent.DefinitionChanged,
    );

    const input = fixture.requiredShadowElement<HTMLInputElement>("input#gain");
    input.value = "0.73";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    await element.updateComplete;

    recorder.events.length.should.equal(1);

    const definition = recorder.last().definition;
    definition.kind.should.equal(OscillatorKind.Basic);
    (definition as IBasicOscillatorDefinition).gain.should.equal(0.73);
  });

  it("should dispatch definition changed when detune changes", async () => {
    const element = await fixture.create(TestOscillatorDefinitions.basic());
    const recorder = new EventRecorder<IOscillatorDefinitionChangedDetail>(
      element,
      OscillatorControlEvent.DefinitionChanged,
    );

    const input = fixture.requiredShadowElement<HTMLInputElement>("input#detune");
    input.value = "14";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    await element.updateComplete;

    recorder.events.length.should.equal(1);

    const definition = recorder.last().definition;
    definition.kind.should.equal(OscillatorKind.Basic);
    (definition as IBasicOscillatorDefinition).detuneCents.should.equal(14);
  });

  it("should forward midi note-on received event", async () => {
    const element = await fixture.create(TestOscillatorDefinitions.basic());
    const recorder = new EventRecorder<IOscillatorMidiNoteOnDetail>(
      element,
      OscillatorControlEvent.MidiNoteOnReceived,
    );

    const detail: IOscillatorMidiNoteOnDetail = {
      channel: 0,
      midiNote: 60,
      frequencyHz: 261.6255653005986,
      velocity: 0.85,
      timeSeconds: 1.25,
    };

    element.dispatchEvent(
      new CustomEvent<IOscillatorMidiNoteOnDetail>("midi-song-player-note-on", {
        detail,
      }),
    );

    recorder.events.length.should.equal(1);
    recorder.last().should.deep.equal(detail);
  });

  it("should forward midi note-off received event", async () => {
    const element = await fixture.create(TestOscillatorDefinitions.basic());
    const recorder = new EventRecorder<IOscillatorMidiNoteOffDetail>(
      element,
      OscillatorControlEvent.MidiNoteOffReceived,
    );

    const detail: IOscillatorMidiNoteOffDetail = {
      channel: 0,
      midiNote: 60,
      frequencyHz: 261.6255653005986,
      timeSeconds: 1.75,
    };

    element.dispatchEvent(
      new CustomEvent<IOscillatorMidiNoteOffDetail>("midi-song-player-note-off", {
        detail,
      }),
    );

    recorder.events.length.should.equal(1);
    recorder.last().should.deep.equal(detail);
  });
});

class OscillatorControlComponentFixture {
  private element: OscillatorControlElement | null = null;

  public async create(
    definition: OscillatorDefinition | null = null,
  ): Promise<OscillatorControlElement> {
    const element = document.createElement("oscillator-control") as OscillatorControlElement;
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

class TestOscillatorDefinitions {
  public static basic(): IBasicOscillatorDefinition {
    return {
      kind: OscillatorKind.Basic,
      waveform: OscillatorWaveformKind.Sine,
      frequencyHz: 440,
      detuneCents: 0,
      phaseRadians: 0,
      gain: 0.5,
    };
  }
}