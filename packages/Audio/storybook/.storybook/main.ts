import type { StorybookConfig } from "@storybook/web-components-vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const storybookRoot = fileURLToPath(new URL("..", import.meta.url));
const monorepoRoot = resolve(storybookRoot, "../../..");

const config: StorybookConfig = {
  framework: "@storybook/web-components-vite",
  stories: [
    "../../*/src/**/*.stories.ts",
    "../../../../Applications/Playing/SVG/UI-Controls/vite-project/src/**/*.stories.ts",
    "../../../../Applications/Playing/core-svg-fabric-products/src/**/*.stories.ts",
    "!../../core.sequencer.ui.resources/src/sequencer-controls.stories.ts"
  ],
  addons: [
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  viteFinal: async (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "@monorepo/core-svg-fabric": resolve(
          monorepoRoot,
          "Applications/Playing/core-svg-fabric/src/index.ts",
        ),
        "@monorepo/core-style-system": resolve(
          monorepoRoot,
          "packages/core-style-system/src/index.ts",
        ),
      },
    },
  }),
};

export default config;
