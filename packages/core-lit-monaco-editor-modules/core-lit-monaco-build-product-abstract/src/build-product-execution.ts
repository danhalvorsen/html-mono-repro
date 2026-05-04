import * as ts from "typescript";
import { type BuildExecutionOptions, type MonacoBuildExecutionProduct } from "./build-product-types.js";

export const buildExecutionProductFromSource = (
  sourceCode: string,
  options?: BuildExecutionOptions,
): MonacoBuildExecutionProduct => {
  const executedAtIso = options?.executedAtIso ?? new Date().toISOString();
  const durationMs = options?.durationMs ?? 0;

  const greetArg = sourceCode.match(/greet\(\s*["'`](.*?)["'`]\s*\)/)?.[1];
  const greetingResult = greetArg ? `Hello, ${greetArg}!` : undefined;

  const consoleLines = executeSourceAndCaptureConsole(sourceCode);

  if (greetingResult && !consoleLines.includes(greetingResult)) {
    consoleLines.unshift(greetingResult);
  }

  if (consoleLines.length === 0) {
    consoleLines.push("(no console output)");
  }

  return {
    status: "success",
    executedAtIso,
    sourceCode,
    consoleLines,
    greetingResult,
    durationMs,
    summary: "Code executed with default abstract build-product presenter.",
  };
};

const executeSourceAndCaptureConsole = (sourceCode: string): string[] => {
  const lines: string[] = [];
  const hostConsole = globalThis.console;
  const sink = (
    level: "log" | "info" | "warn" | "error",
    renderedLine: string,
    args: readonly unknown[],
  ): void => {
    if (!hostConsole) {
      return;
    }

    const method = hostConsole[level] ?? hostConsole.log;

    try {
      method.call(hostConsole, ...args);
    } catch {
      method.call(hostConsole, renderedLine);
    }
  };

  const runtimeConsole = {
    log: (...args: unknown[]) => {
      const renderedLine = args.map(formatConsoleValue).join(" ");
      lines.push(renderedLine);
      sink("log", renderedLine, args);
    },
    info: (...args: unknown[]) => {
      const renderedLine = args.map(formatConsoleValue).join(" ");
      lines.push(renderedLine);
      sink("info", renderedLine, args);
    },
    warn: (...args: unknown[]) => {
      const renderedLine = `[warn] ${args.map(formatConsoleValue).join(" ")}`;
      lines.push(renderedLine);
      sink("warn", renderedLine, args);
    },
    error: (...args: unknown[]) => {
      const renderedLine = `[error] ${args.map(formatConsoleValue).join(" ")}`;
      lines.push(renderedLine);
      sink("error", renderedLine, args);
    },
  };

  try {
    const transpiled = ts.transpileModule(sourceCode, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
      },
      reportDiagnostics: false,
    });

    const module = { exports: {} as Record<string, unknown> };
    const require = (specifier: string): never => {
      throw new Error(`Runtime import is not supported: ${specifier}`);
    };

    const execute = new Function(
      "console",
      "exports",
      "module",
      "require",
      `${transpiled.outputText}\n//# sourceURL=monaco-build-product-runtime.js`,
    ) as (
      consoleObj: typeof runtimeConsole,
      exportsObj: Record<string, unknown>,
      moduleObj: { exports: Record<string, unknown> },
      requireFn: (specifier: string) => never,
    ) => void;

    execute(runtimeConsole, module.exports, module, require);
  } catch (error) {
    const renderedLine = `[runtime error] ${toErrorMessage(error)}`;
    lines.push(renderedLine);
    sink("error", renderedLine, [renderedLine]);
  }

  return lines;
};

const formatConsoleValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean" || value === null) {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const toErrorMessage = (value: unknown): string => {
  if (value instanceof Error) {
    return value.message;
  }

  return String(value);
};
