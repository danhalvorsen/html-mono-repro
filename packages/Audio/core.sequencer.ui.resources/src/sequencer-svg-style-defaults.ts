import type { IDigitButtonStyle } from "./digitButton.js";
import type { IRgbButtonStyle } from "./rgbButton.js";
import type { IToneLabelStyle } from "./toneLabel.js";
import type { ITransportButtonStyle } from "./transportButton.js";
import type { IShiftButtonStyle } from "./shiftButton.js";

export interface IKnobButtonPalette {
  readonly ringStrokeOn: string;
  readonly ringStrokeOff: string;
  readonly ringStrokeWidth: number;
  readonly rimGradientMiddle: string;
  readonly indicatorStrokeOn: string;
  readonly indicatorStrokeOff: string;
  readonly bodyFillOn: string;
  readonly bodyFillOff: string;
}

export function freezeDigitButtonStyle(style: IDigitButtonStyle): IDigitButtonStyle {
  return Object.freeze({ ...style });
}

export function freezeRgbButtonStyle(style: IRgbButtonStyle): IRgbButtonStyle {
  return Object.freeze({ ...style });
}

export function freezeKnobButtonPalette(palette: IKnobButtonPalette): IKnobButtonPalette {
  return Object.freeze({ ...palette });
}

export function freezeToneLabelStyle(style: IToneLabelStyle): IToneLabelStyle {
  return Object.freeze({ ...style });
}

export function freezeTransportButtonStyle(style: ITransportButtonStyle): ITransportButtonStyle {
  return Object.freeze({ ...style });
}

export function freezeShiftButtonStyle(style: IShiftButtonStyle): IShiftButtonStyle {
  return Object.freeze({ ...style });
}