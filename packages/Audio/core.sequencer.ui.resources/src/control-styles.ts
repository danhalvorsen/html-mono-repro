import { SequencerUiTokenKeys } from "./ui-tokens.js";
import {
  freezeDigitButtonStyle,
  freezeKnobButtonPalette,
  freezeRgbButtonStyle,
  freezeShiftButtonStyle,
  freezeToneLabelStyle,
  freezeTransportButtonStyle,
  type IKnobButtonPalette,
} from "./sequencer-svg-style-defaults.js";
import type { IStyleTokenResolver } from "./style-resolver.js";
import { StyleValueHelpers } from "./style-helpers.js";
import type { IDigitButtonStyle } from "./digitButton.js";
import type { IRgbButtonStyle } from "./rgbButton.js";
import type { IToneLabelStyle } from "./toneLabel.js";
import type { ITransportButtonStyle } from "./transportButton.js";
import type { IShiftButtonStyle } from "./shiftButton.js";

export type { IKnobButtonPalette };

/* ============================================================================
 * Factory Interfaces
 * ============================================================================
 */

export interface IDigitButtonStyleFactory {
  create(): IDigitButtonStyle;
}

export interface IRgbButtonStyleFactory {
  create(): IRgbButtonStyle;
}

export interface IKnobButtonPaletteFactory {
  create(): IKnobButtonPalette;
}

export interface IToneLabelStyleFactory {
  create(): IToneLabelStyle;
}

export interface ITransportButtonStyleFactory {
  create(): ITransportButtonStyle;
}

export interface IShiftButtonStyleFactory {
  create(): IShiftButtonStyle;
}

/* ============================================================================
 * Factory Implementations
 * ============================================================================
 */

export class DigitButtonStyleFactory implements IDigitButtonStyleFactory {
  public constructor(private readonly resolver: IStyleTokenResolver) {}

  public create(): IDigitButtonStyle {
    const surface = this.resolver.resolve({ token: SequencerUiTokenKeys.SURFACE });
    const axis = this.resolver.resolve({ token: SequencerUiTokenKeys.AXIS });
    const line = this.resolver.resolve({ token: SequencerUiTokenKeys.LINE });

    return freezeDigitButtonStyle({
      fill: StyleValueHelpers.colorOr(surface.fill?.color, "#202734"),
      stroke: StyleValueHelpers.colorOr(surface.stroke?.color, "#dff0ff"),
      strokeWidth: StyleValueHelpers.numberOr(surface.stroke?.width, 2.6),
      borderRadius: 11,
      textColor: "#f5fbff",
      shellFill: StyleValueHelpers.colorOr(axis.stroke?.color, "#252c37"),
      faceFill: "#1a202b",
      onFrameColor: StyleValueHelpers.colorOr(surface.stroke?.color, "#ecf4ff"),
      offFrameColor: "#7a8499",
      onInnerFrameColor: StyleValueHelpers.colorOr(line.stroke?.color, "#9edcff"),
      offInnerFrameColor: "#556179",
      onAccentColor: StyleValueHelpers.colorOr(line.stroke?.color, "#19d8ff"),
      offAccentColor: "#4d6778",
      rimWidth: 2.6,
      innerFrameWidth: 1.8,
      edgeInset: 2,
      faceInset: 9,
      numberVerticalOffset: -2,
      onFill: "#202734",
      onStroke: StyleValueHelpers.colorOr(surface.stroke?.color, "#ecf4ff"),
      onTextColor: "#f7fbff",
      offFill: "#181e28",
      offStroke: "#6f788d",
      offTextColor: "#8b95a8",
      fontFamily: StyleValueHelpers.designSystemFontFamily,
      fontSize: 34,
      fontWeight: 600,
      accentColor: StyleValueHelpers.colorOr(line.stroke?.color, "#19d8ff"),
      accentHeight: 4,
      accentInsetX: 14,
      accentInsetBottom: 12,
    });
  }
}

export class RgbButtonStyleFactory implements IRgbButtonStyleFactory {
  public constructor(private readonly resolver: IStyleTokenResolver) {}

  public create(): IRgbButtonStyle {
    const shell = this.resolver.resolve({ token: SequencerUiTokenKeys.RGB_BUTTON_SHELL });
    const off = this.resolver.resolve({ token: SequencerUiTokenKeys.RGB_BUTTON_OFF });

    return freezeRgbButtonStyle({
      borderRadius: 12,
      borderWidth: StyleValueHelpers.numberOr(shell.stroke?.width, 2),
      shellFill: StyleValueHelpers.colorOr(shell.fill?.color, "#161c24"),
      offOpacity: off.opacity ?? 0.35,
    });
  }
}

export class KnobButtonPaletteFactory implements IKnobButtonPaletteFactory {
  public constructor(private readonly resolver: IStyleTokenResolver) {}

  public create(): IKnobButtonPalette {
    const ringOn = this.resolver.resolve({ token: SequencerUiTokenKeys.KNOB_BUTTON_RING });
    const ringOff = this.resolver.resolve({ token: SequencerUiTokenKeys.KNOB_BUTTON_RING_OFF });
    const bodyOn = this.resolver.resolve({ token: SequencerUiTokenKeys.KNOB_BUTTON_BODY_ON });
    const bodyOff = this.resolver.resolve({ token: SequencerUiTokenKeys.KNOB_BUTTON_BODY_OFF });
    const indicatorOn = this.resolver.resolve({ token: SequencerUiTokenKeys.KNOB_BUTTON_INDICATOR });
    const indicatorOff = this.resolver.resolve({ token: SequencerUiTokenKeys.KNOB_BUTTON_INDICATOR_OFF });
    const surface = this.resolver.resolve({ token: SequencerUiTokenKeys.SURFACE });

    return freezeKnobButtonPalette({
      ringStrokeOn: StyleValueHelpers.colorOr(ringOn.stroke?.color, "#3d4657"),
      ringStrokeOff: StyleValueHelpers.colorOr(ringOff.stroke?.color, "#283042"),
      ringStrokeWidth: StyleValueHelpers.numberOr(surface.stroke?.width, 2.6),
      rimGradientMiddle: StyleValueHelpers.colorOr(surface.stroke?.color, "#1c2331"),
      indicatorStrokeOn: StyleValueHelpers.colorOr(indicatorOn.stroke?.color, "#f0f5ff"),
      indicatorStrokeOff: StyleValueHelpers.colorOr(indicatorOff.stroke?.color, "#f0f5ff"),
      bodyFillOn: StyleValueHelpers.colorOr(bodyOn.fill?.color, "#03060d"),
      bodyFillOff: StyleValueHelpers.colorOr(bodyOff.fill?.color, "#101621"),
    });
  }
}

export class ToneLabelStyleFactory implements IToneLabelStyleFactory {
  public constructor(private readonly resolver: IStyleTokenResolver) {}

  public create(): IToneLabelStyle {
    const background = this.resolver.resolve({ token: SequencerUiTokenKeys.TONE_LABEL_BACKGROUND });
    const text = this.resolver.resolve({ token: SequencerUiTokenKeys.TONE_LABEL_TEXT });
    const border = this.resolver.resolve({ token: SequencerUiTokenKeys.TONE_LABEL_BORDER });

    return freezeToneLabelStyle({
      margin: "12% 6%",
      borderRadius: 7,
      fillColor: StyleValueHelpers.colorOr(background.fill?.color, "#12161f"),
      textColor: StyleValueHelpers.colorOr(text.fill?.color, "#f1efe6"),
      strokeColor: StyleValueHelpers.colorOr(border.stroke?.color, "#d8d3c4"),
      strokeWidth: StyleValueHelpers.numberOr(border.stroke?.width, 0),
      fontFamily: StyleValueHelpers.designSystemFontFamily,
      fontSize: 12,
      fontWeight: 700,
    });
  }
}

export class TransportButtonStyleFactory implements ITransportButtonStyleFactory {
  public constructor(private readonly resolver: IStyleTokenResolver) {}

  public create(): ITransportButtonStyle {
    const shell = this.resolver.resolve({ token: SequencerUiTokenKeys.TRANSPORT_BUTTON_SHELL });
    const icon = this.resolver.resolve({ token: SequencerUiTokenKeys.TRANSPORT_BUTTON_ICON });
    const label = this.resolver.resolve({ token: SequencerUiTokenKeys.TRANSPORT_BUTTON_LABEL });

    return freezeTransportButtonStyle({
      fill: StyleValueHelpers.colorOr(shell.fill?.color, "#e2e6ee"),
      stroke: StyleValueHelpers.colorOr(shell.stroke?.color, "#8892a8"),
      strokeWidth: StyleValueHelpers.numberOr(shell.stroke?.width, 1.5),
      iconFill: StyleValueHelpers.colorOr(icon.fill?.color, "#1c2234"),
      iconStroke: StyleValueHelpers.colorOr(icon.stroke?.color, "#1c2234"),
      iconStrokeWidth: StyleValueHelpers.numberOr(icon.stroke?.width, 2),
      labelColor: StyleValueHelpers.colorOr(label.fill?.color, "#2a3248"),
      fontFamily: StyleValueHelpers.designSystemFontFamily,
      fontSize: 11,
      borderRadius: 10,
    });
  }
}

export class ShiftButtonStyleFactory implements IShiftButtonStyleFactory {
  public constructor(private readonly resolver: IStyleTokenResolver) {}

  public create(): IShiftButtonStyle {
    const face = this.resolver.resolve({ token: SequencerUiTokenKeys.SHIFT_BUTTON_FACE });
    const text = this.resolver.resolve({ token: SequencerUiTokenKeys.SHIFT_BUTTON_TEXT });

    return freezeShiftButtonStyle({
      fill: StyleValueHelpers.colorOr(face.fill?.color, "#00BCD4"),
      stroke: StyleValueHelpers.colorOr(face.stroke?.color, "#0097A7"),
      strokeWidth: StyleValueHelpers.numberOr(face.stroke?.width, 1.5),
      textColor: StyleValueHelpers.colorOr(text.fill?.color, "#f0f8ff"),
      fontFamily: StyleValueHelpers.designSystemFontFamily,
      fontSize: 13,
      fontWeight: 600,
      borderRadius: 10,
    });
  }
}

/* ============================================================================
 * Composition
 * ============================================================================
 */

export interface IControlStyleFactories {
  readonly digitButton: IDigitButtonStyleFactory;
  readonly rgbButton: IRgbButtonStyleFactory;
  readonly knobButton: IKnobButtonPaletteFactory;
  readonly toneLabel: IToneLabelStyleFactory;
  readonly transportButton: ITransportButtonStyleFactory;
  readonly shiftButton: IShiftButtonStyleFactory;
}

export class ControlStyleComposition implements IControlStyleFactories {
  public constructor(
    public readonly digitButton: IDigitButtonStyleFactory,
    public readonly rgbButton: IRgbButtonStyleFactory,
    public readonly knobButton: IKnobButtonPaletteFactory,
    public readonly toneLabel: IToneLabelStyleFactory,
    public readonly transportButton: ITransportButtonStyleFactory,
    public readonly shiftButton: IShiftButtonStyleFactory,
  ) {}
}

export class ControlStyleComposer {
  public compose(resolver: IStyleTokenResolver): IControlStyleFactories {
    return new ControlStyleComposition(
      new DigitButtonStyleFactory(resolver),
      new RgbButtonStyleFactory(resolver),
      new KnobButtonPaletteFactory(resolver),
      new ToneLabelStyleFactory(resolver),
      new TransportButtonStyleFactory(resolver),
      new ShiftButtonStyleFactory(resolver),
    );
  }
}

