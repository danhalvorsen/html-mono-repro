import {
  STYLE_TOKENS,
  StyleLibrary,
  StyleResolver,
  type IStyle,
  type IStyleReference,
  type IStyleResolver,
  type IStyleToken,
} from "@monorepo/core-style-system";
import type { SvgStrokeFillStyle } from "../domain/svg-node.js";

export type SvgStyleReference = IStyleReference;
export type SvgStyleTokenRecord = Readonly<Record<string, IStyleToken>>;

export function createSvgStyleResolver(
  ...tokenRecords: readonly SvgStyleTokenRecord[]
): StyleResolver {
  return new StyleResolver([
    new StyleLibrary(STYLE_TOKENS),
    ...tokenRecords.map((tokens) => new StyleLibrary(tokens)),
  ]);
}

export function resolveSvgStrokeFillStyle(
  resolver: IStyleResolver,
  reference?: Readonly<SvgStyleReference>,
): SvgStrokeFillStyle {
  return svgStrokeFillStyleFromCoreStyle(resolver.resolve(reference));
}

export function svgStrokeFillStyleFromCoreStyle(
  style: Readonly<IStyle>,
): SvgStrokeFillStyle {
  const strokeDasharray =
    style.stroke?.dash !== undefined && style.stroke.dash.length > 0
      ? style.stroke.dash.join(" ")
      : undefined;

  return {
    ...(style.fill?.color !== undefined ? { fill: style.fill.color } : {}),
    ...(style.stroke?.color !== undefined ? { stroke: style.stroke.color } : {}),
    ...(style.stroke?.width !== undefined
      ? { strokeWidth: style.stroke.width }
      : {}),
    ...(strokeDasharray !== undefined ? { strokeDasharray } : {}),
    ...(style.opacity !== undefined ? { opacity: style.opacity } : {}),
  };
}
