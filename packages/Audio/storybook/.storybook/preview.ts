import type { Preview } from "@storybook/web-components-vite";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "demo-dark",
      values: [
        {
          name: "demo-dark",
          value: "#0f1420",
        },
      ],
    },
    controls: {
      expanded: true
    },
    layout: "centered"
  }
};

export default preview;
