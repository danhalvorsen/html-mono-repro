module.exports = {
  default: {
    paths: ["tests/**/*.feature"],
    import: ["tests/cucumber.setup.ts", "tests/**/*.steps.ts"],
    format: ["progress"],
  },
};
