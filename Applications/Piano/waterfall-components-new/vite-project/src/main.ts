import { NoteSymbol } from "@monorepo/music-core-midi";
import {
  TimedButtonElement,
  TimedButtonElementTagName,
  TimedButtonEventName,
  type TimedButtonHoldCompletedDetail,
} from "./component/TimedButtonElement.js";
import { Waterfall, WaterfallElementTagName } from "./component/Waterfall.js";
import { MidiMapper } from "./mapper/midiMapper.js";

const NotesToAdd: Array<NoteSymbol> = [
  NoteSymbol.C,
  NoteSymbol.E,
  NoteSymbol.G,
];

function queryRequiredElement<TElement extends Element>(
  tagName: string,
  elementType: { new (): TElement },
): TElement {
  const element = document.querySelector(tagName);

  if (!(element instanceof elementType)) {
    throw new Error(`Required element was not found: ${tagName}`);
  }

  return element;
}

function composeApplication(): void {
  const timedButton = queryRequiredElement(
    TimedButtonElementTagName,
    TimedButtonElement,
  );

  const waterfall = queryRequiredElement(
    WaterfallElementTagName,
    Waterfall,
  );

  const midiMapper = new MidiMapper(waterfall);

  timedButton.addEventListener(
    TimedButtonEventName.HoldCompleted,
    ((event: CustomEvent<TimedButtonHoldCompletedDetail>): void => {
      midiMapper.play(NotesToAdd, event.detail.heldMs);
    }) as EventListener,
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", composeApplication, {
    once: true,
  });
} else {
  composeApplication();
}