// packages/core-typescript-refactoring/src/main.ts

import {
  TypeScriptRefactoringCliApplication,
  TypeScriptRefactoringCliCompositionRoot,
} from "./code.js";

export class ProcessExitCode {
  public static readonly Success = 0;
  public static readonly Failure = 1;
}

export class Main {
  public async run(argv: readonly string[]): Promise<number> {
    try {
      const compositionRoot = new TypeScriptRefactoringCliCompositionRoot();
      const application = new TypeScriptRefactoringCliApplication(
        compositionRoot.composeRunner(),
        compositionRoot.getResultWriter(),
      );

      await application.run(argv);
      return ProcessExitCode.Success;
    } catch (error) {
      console.error(error);
      return ProcessExitCode.Failure;
    }
  }
}

const main = new Main();
const exitCode = await main.run(process.argv.slice(2));
process.exit(exitCode);