import { html } from "lit";
import {
  ifDefined,
  optionalStyleAttributes,
  productShapeStoryStyleArgTypes,
  productShapeStoryStyleArgs,
  renderProductShapeStoryFrame,
  type ProductShapeStoryStyleArgs,
} from "../../storybook/product-shape-story-frame.js";
import "./svg-fabric-triangle.js";

interface SvgFabricTriangleStoryArgs extends ProductShapeStoryStyleArgs {
  readonly side: number;
}

const meta = {
  title: "Core SVG Fabric Products/Triangle",
  tags: ["autodocs"],
  render: (args: SvgFabricTriangleStoryArgs) => {
    const style = optionalStyleAttributes(args);

    return renderProductShapeStoryFrame(html`
      <svg-fabric-triangle
        side=${args.side}
        token=${args.token}
        fill=${ifDefined(style.fill)}
        stroke=${ifDefined(style.stroke)}
        stroke-width=${ifDefined(style.strokeWidth)}
      ></svg-fabric-triangle>
    `);
  },
  args: {
    ...productShapeStoryStyleArgs,
    side: 96,
  },
  argTypes: {
    side: { control: { type: "number", min: 2, max: 220, step: 1 } },
    ...productShapeStoryStyleArgTypes,
  },
};

export default meta;

export const Default = {};

export const Outline = {
  args: {
    fill: "transparent",
    strokeWidth: 3,
  },
};
