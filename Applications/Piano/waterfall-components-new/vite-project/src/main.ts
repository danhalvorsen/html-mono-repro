import {
  TimedButtonElement,
  TimedButtonElementTagName,
} from "./component/TimedButtonElement.js";
import { TimedButtonWaterfallBinder } from "./component/TimedButtonWaterfallBinder.js";
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

function composeApplication(): void {
  const timedButton = queryRequiredElement(
    TimedButtonElementTagName,
    TimedButtonElement,
  );

  const waterfall = queryRequiredElement(
    WaterfallElementTagName,
    Waterfall,
  );

  new TimedButtonWaterfallBinder(timedButton, waterfall).bind();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", composeApplication, {
    once: true,
  });
} else {
  composeApplication();
}
