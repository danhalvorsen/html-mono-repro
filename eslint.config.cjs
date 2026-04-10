// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

const { createBaseConfig } = require('./eslint.base.cjs');

module.exports = createBaseConfig({
  tsconfigRootDir: __dirname,
});
