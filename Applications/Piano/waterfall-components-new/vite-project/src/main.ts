import { Constants } from "./constants.ts";
import {
  TimedButtonElement,
  TimedButtonElementTagName,
  TimedButtonEventName,
  type TimedButtonHoldCancelledDetail,
  type TimedButtonHoldChangedDetail,
  type TimedButtonHoldCompletedDetail,
  type TimedButtonHoldStartedDetail,
} from "./component/TimedButtonElement.js";
import { Waterfall, WaterfallElementTagName } from "./component/Waterfall.js";

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

function createRandomColumnIndex(): number {
  return Math.floor(Math.random() * Constants.numberColumns);
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

  let activeColumnIndex: number | null = null;

  timedButton.addEventListener(
    TimedButtonEventName.HoldStarted,
    ((event: CustomEvent<TimedButtonHoldStartedDetail>): void => {
      activeColumnIndex = createRandomColumnIndex();

      waterfall.createGavityFallingObjectInColumn(
        activeColumnIndex,
        event.detail.heldMs,
      );
    }) as EventListener,
  );

  timedButton.addEventListener(
    TimedButtonEventName.HoldChanged,
    ((event: CustomEvent<TimedButtonHoldChangedDetail>): void => {
      if (activeColumnIndex === null) {
        return;
      }

      waterfall.updateGavityFallingObjectHeightInColumn(
        activeColumnIndex,
        event.detail.heldMs,
      );
    }) as EventListener,
  );

  timedButton.addEventListener(
    TimedButtonEventName.HoldCompleted,
    ((event: CustomEvent<TimedButtonHoldCompletedDetail>): void => {
      if (activeColumnIndex === null) {
        return;
      }

      const columnIndex = activeColumnIndex;
      activeColumnIndex = null;

      waterfall.completeGavityFallingObjectInColumn(
        columnIndex,
        event.detail.heldMs,
      );
    }) as EventListener,
  );

  timedButton.addEventListener(
    TimedButtonEventName.HoldCancelled,
    ((_event: CustomEvent<TimedButtonHoldCancelledDetail>): void => {
      if (activeColumnIndex === null) {
        return;
      }

      const columnIndex = activeColumnIndex;
      activeColumnIndex = null;

      waterfall.cancelGavityFallingObjectInColumn(columnIndex);
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
