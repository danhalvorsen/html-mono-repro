
export interface ILoaderTestFixture {
  readonly schemaYaml: string;
  createValidJson(): string;
  createInvalidMissingProjectIdJson(): string;
  createInvalidAdditionalPropertyJson(): string;
  createInvalidStepOutOfRangeJson(): string;
}
