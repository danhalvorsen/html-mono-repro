import { html } from "lit";
import {
  ifDefined,
  optionalStyleAttributes,
  productShapeStoryStyleArgTypes,
  productShapeStoryStyleArgs,
  renderProductShapeStoryFrame,
  type ProductShapeStoryStyleArgs,
} from "../../storybook/product-shape-story-frame.js";
import "./svg-fabric-circle.js";

interface SvgFabricCircleStoryArgs extends ProductShapeStoryStyleArgs {
  readonly radius: number;
}

const meta = {
  title: "Core SVG Fabric Products/Circle",
  tags: ["autodocs"],
  render: (args: SvgFabricCircleStoryArgs) => {
    const style = optionalStyleAttributes(args);

    return renderProductShapeStoryFrame(html`
      <svg-fabric-circle
        radius=${args.radius}
        token=${args.token}
        fill=${ifDefined(style.fill)}
        stroke=${ifDefined(style.stroke)}
        stroke-width=${ifDefined(style.strokeWidth)}
      ></svg-fabric-circle>
    `);
  },
  args: {
    ...productShapeStoryStyleArgs,
    radius: 48,
  },
  argTypes: {
    radius: { control: { type: "number", min: 2, max: 160, step: 1 } },
    ...productShapeStoryStyleArgTypes,
  },
};

export default meta;

export const Default = {};

export const TokenOverride = {
  args: {
    fill: "#ffffff",
    strokeWidth: 4,
  },
};
