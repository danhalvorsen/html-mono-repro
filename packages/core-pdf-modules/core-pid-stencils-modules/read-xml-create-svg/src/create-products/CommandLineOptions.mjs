export class CommandLineOptions {
  constructor(inputDirectory, outputFile) {
    if (!inputDirectory || inputDirectory.trim().length === 0) {
      throw new Error("inputDirectory is required.");
    }

    if (!outputFile || outputFile.trim().length === 0) {
      throw new Error("outputFile is required.");
    }

    this.inputDirectory = inputDirectory;
    this.outputFile = outputFile;
  }

  static fromArgv(argv, pathAdapter) {
    const input = CommandLineOptions.#readOption(argv, "--input") ?? "./data";
    const output = CommandLineOptions.#readOption(argv, "--output") ?? "./generated/products.json";

    return new CommandLineOptions(
      pathAdapter.resolve(input),
      pathAdapter.resolve(output),
    );
  }

  static #readOption(argv, name) {
    const index = argv.indexOf(name);

    if (index < 0) {
      return undefined;
    }

    const value = argv[index + 1];

    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${name}.`);
    }

    return value;
  }
}