const { createBaseConfig } = require('./eslint.base.cjs');

module.exports = createBaseConfig({
  tsconfigRootDir: __dirname,
});
