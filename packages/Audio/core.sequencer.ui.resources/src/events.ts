import type { Digit } from "./digitButton.js";
import type { KnobVariant } from "./knobButton.js";
import type { TransportButtonVariant } from "./transportButton.js";

/**
 * Typed event name constants for all sequencer UI web components.
 * Use these instead of raw strings to avoid magic string violations.
 */

export const DigitButtonEvents = {
  /**
   * Emitted by sequencer-digit-button when the user presses a digit.
   * Parent owns selection state; this is intent only.
   */
  pressed: "digit-press",
} as const;

export interface IDigitButtonPressedDetail {
  readonly digit: Digit;
}

export const DigitButtonRowEvents = {
  /**
   * Emitted by sequencer-digit-button-row when the selected digit changes.
   * -1 means no digit is selected.
   */
  selectionChanged: "digit-selection-change",
} as const;

export interface IDigitButtonRowSelectionChangedDetail {
  readonly selectedDigit: Digit | -1;
}

export const TransportButtonEvents = {
  /**
   * Emitted by sequencer-transport-button when pressed.
   */
  pressed: "transport-press",
} as const;

export interface ITransportButtonPressedDetail {
  readonly variant: TransportButtonVariant;
}

export const KnobButtonEvents = {
  /**
   * Emitted by sequencer-knob-button when the user requests a toggle.
   * Parent owns the on/off state.
   */
  toggleRequested: "knob-toggle",
} as const;

export interface IKnobButtonToggleRequestedDetail {
  readonly variant: KnobVariant;
  readonly on: boolean;
}

export const RgbButtonEvents = {
  /**
   * Emitted by sequencer-rgb-button when the user requests a toggle.
   * Parent owns the on/off state.
   */
  toggleRequested: "rgb-button-toggle",
} as const;

export interface IRgbButtonToggleRequestedDetail {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly on: boolean;
}

export const ShiftButtonEvents = {
  /**
   * Emitted by sequencer-shift-button when pressed.
   */
  pressed: "shift-press",
} as const;
