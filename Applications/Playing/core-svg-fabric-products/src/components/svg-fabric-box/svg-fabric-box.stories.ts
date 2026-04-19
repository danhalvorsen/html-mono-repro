import { html } from "lit";
import {
  ifDefined,
  optionalStyleAttributes,
  productShapeStoryStyleArgTypes,
  productShapeStoryStyleArgs,
  renderProductShapeStoryFrame,
  type ProductShapeStoryStyleArgs,
} from "../../storybook/product-shape-story-frame.js";
import "./svg-fabric-box.js";

interface SvgFabricBoxStoryArgs extends ProductShapeStoryStyleArgs {
  readonly width: number;
  readonly height: number;
}

const meta = {
  title: "Core SVG Fabric Products/Box",
  tags: ["autodocs"],
  render: (args: SvgFabricBoxStoryArgs) => {
    const style = optionalStyleAttributes(args);

    return renderProductShapeStoryFrame(html`
      <svg-fabric-box
        width=${args.width}
        height=${args.height}
        token=${args.token}
        fill=${ifDefined(style.fill)}
        stroke=${ifDefined(style.stroke)}
        stroke-width=${ifDefined(style.strokeWidth)}
      ></svg-fabric-box>
    `);
  },
  args: {
    ...productShapeStoryStyleArgs,
    width: 96,
    height: 72,
  },
  argTypes: {
    width: { control: { type: "number", min: 2, max: 220, step: 1 } },
    height: { control: { type: "number", min: 2, max: 180, step: 1 } },
    ...productShapeStoryStyleArgTypes,
  },
};

export default meta;

export const Default = {};

export const Wide = {
  args: {
    width: 150,
    height: 54,
  },
};
