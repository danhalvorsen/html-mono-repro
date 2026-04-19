import { html } from "lit";
import {
  ifDefined,
  optionalStyleAttributes,
  productShapeStoryStyleArgTypes,
  productShapeStoryStyleArgs,
  renderProductShapeStoryFrame,
  type ProductShapeStoryStyleArgs,
} from "../../storybook/product-shape-story-frame.js";
import "./svg-fabric-box-triangle.js";

interface SvgFabricBoxTriangleStoryArgs extends ProductShapeStoryStyleArgs {
  readonly boxWidth: number;
  readonly boxHeight: number;
  readonly triangleSide: number;
  readonly gap: number;
}

const meta = {
  title: "Core SVG Fabric Products/Box Triangle",
  tags: ["autodocs"],
  render: (args: SvgFabricBoxTriangleStoryArgs) => {
    const style = optionalStyleAttributes(args);

    return renderProductShapeStoryFrame(html`
      <svg-fabric-box-triangle
        box-width=${args.boxWidth}
        box-height=${args.boxHeight}
        triangle-side=${args.triangleSide}
        gap=${args.gap}
        token=${args.token}
        fill=${ifDefined(style.fill)}
        stroke=${ifDefined(style.stroke)}
        stroke-width=${ifDefined(style.strokeWidth)}
      ></svg-fabric-box-triangle>
    `);
  },
  args: {
    ...productShapeStoryStyleArgs,
    fill: "#1d9bf0",
    stroke: "#0b5a8f",
    boxWidth: 96,
    boxHeight: 72,
    triangleSide: 72,
    gap: 16,
  },
  argTypes: {
    boxWidth: { control: { type: "number", min: 2, max: 220, step: 1 } },
    boxHeight: { control: { type: "number", min: 2, max: 180, step: 1 } },
    triangleSide: { control: { type: "number", min: 2, max: 180, step: 1 } },
    gap: { control: { type: "number", min: 0, max: 80, step: 1 } },
    ...productShapeStoryStyleArgTypes,
  },
};

export default meta;

export const Default = {};

export const Compact = {
  args: {
    boxWidth: 84,
    boxHeight: 52,
    triangleSide: 52,
    gap: 8,
  },
};
