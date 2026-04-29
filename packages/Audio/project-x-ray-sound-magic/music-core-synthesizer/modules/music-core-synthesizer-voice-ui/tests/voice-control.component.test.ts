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
