import {
  TimedButtonElement,
  TimedButtonElementTagName,
  TimedButtonEventName,
  type TimedButtonHoldChangedDetail,
  type TimedButtonHoldStartedDetail,
  type TimedButtonHoldCancelledDetail,
  type TimedButtonHoldCompletedDetail,
} from "./component/TimedButtonElement.js";
import { Waterfall, WaterfallElementTagName } from "./component/Waterfall.js";
import { AccordBuilder, type Accord } from "./Accords/index.js";
import { MidiMapper } from "./mapper/midiMapper.js";

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

function createAccordHeader(waterfall: Waterfall): HTMLHeadingElement {
  const header = document.createElement("h4");

  header.textContent = "No accord played";
  header.style.margin = "0 0 8px 0";

  waterfall.parentElement?.insertBefore(header, waterfall);

  return header;
}

function formatAccordName(accord: Accord): string {
  return `${accord.root} ${accord.formula.name}`;
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

  const accordHeader = createAccordHeader(waterfall);
  const accordBuilder = new AccordBuilder();
  const midiMapper = new MidiMapper(waterfall);
  let activeAccord: Accord | null = null;

  timedButton.addEventListener(
    TimedButtonEventName.HoldStarted,
    ((_event: CustomEvent<TimedButtonHoldStartedDetail>): void => {
      const accord = accordBuilder.createRandom();
      activeAccord = accord;
      accordHeader.textContent = formatAccordName(accord);
      midiMapper.start(accord.notes);
    }) as EventListener,
  );

  timedButton.addEventListener(
    TimedButtonEventName.HoldChanged,
    ((event: CustomEvent<TimedButtonHoldChangedDetail>): void => {
      midiMapper.update(event.detail.heldMs);
    }) as EventListener,
  );

  timedButton.addEventListener(
    TimedButtonEventName.HoldCompleted,
    ((event: CustomEvent<TimedButtonHoldCompletedDetail>): void => {
      if (activeAccord === null) {
        return;
      }
      midiMapper.stop(false, event.detail.heldMs);
      activeAccord = null;
    }) as EventListener,
  );

  timedButton.addEventListener(
    TimedButtonEventName.HoldCancelled,
    ((event: CustomEvent<TimedButtonHoldCancelledDetail>): void => {
      if (activeAccord === null) {
        return;
      }
      midiMapper.stop(true, event.detail.heldMs);
      activeAccord = null;
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
