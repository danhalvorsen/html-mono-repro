import { HoldDurationMovementPlanFactory } from "./HoldDurationMovementPlanFactory.ts";
import { TimedButtonElement, TimedButtonElementTagName } from "./TimedButtonElement.ts";
import { TimedButtonWaterfallBinder } from "./TimedButtonWaterfallBinder.ts";
import { Waterfall, WaterfallElementTagName } from "./music-waterfall.ts";

/**
 * Purposefully queries for a required element and throws an error if it is not found or of the wrong type.                                 
 * @param tagName The tag name of the element to query.
 * @param elementType The constructor of the expected element type.
 * @returns The queried element if found and of the correct type.
 */
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
/**
 * Composes the main application by querying required elements and binding them together.
 */
function composeApplication(): void {
  const timedButton = queryRequiredElement(
    TimedButtonElementTagName,
    TimedButtonElement,
  );

  const waterfall = queryRequiredElement(
    WaterfallElementTagName,
    Waterfall,
  );

  new TimedButtonWaterfallBinder(
    timedButton,
    waterfall,
    new HoldDurationMovementPlanFactory(),
  ).bind();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", composeApplication, {
    once: true,
  });
} else {
  composeApplication();
}
