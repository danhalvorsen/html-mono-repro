// tests/fixtures/messageFixtures.ts
export const sampleCategory = "TestCategory";

export const sampleParams = {
  file: "index.ts",
  value: 42,
  flag: true
};

export const templateSimple = "Hello world";
export const templateWithParams = "Processing {file} with value {value}";
export const templateMissing = "Unknown {missingKey}";
