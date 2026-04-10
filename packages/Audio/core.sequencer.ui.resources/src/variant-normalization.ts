import type { KnobVariant } from "./knobButton.js";
import type { TransportButtonVariant } from "./transportButton.js";

export function normalizeKnobVariant(value: string): KnobVariant {
  if (
    value === "matte"
    || value === "glossy"
    || value === "ribbed"
    || value === "beveled"
  ) {
    return value;
  }

  return "matte";
}

export function normalizeTransportButtonVariant(
  value: string,
): TransportButtonVariant {
  if (value === "stop" || value === "record") {
    return value;
  }

  return "play";
}