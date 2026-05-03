import * as monaco from "monaco-editor";

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

let isConfigured = false;

type MonacoWorkerFactory = new () => Worker;

const workerFactoriesByLabel: Readonly<Record<string, MonacoWorkerFactory>> = {
  json: jsonWorker,
  css: cssWorker,
  scss: cssWorker,
  less: cssWorker,
  html: htmlWorker,
  handlebars: htmlWorker,
  razor: htmlWorker,
  typescript: tsWorker,
  javascript: tsWorker,
};

export const configureMonacoEnvironment = (): void => {
  if (isConfigured) {
    return;
  }

  const monacoEnvironment: monaco.Environment = {
    getWorker(_workerId: string, label: string): Worker {
      const WorkerFactory = workerFactoriesByLabel[label];
      return WorkerFactory ? new WorkerFactory() : new editorWorker();
    },
  };

  (globalThis as unknown as { MonacoEnvironment: monaco.Environment }).MonacoEnvironment =
    monacoEnvironment;

  isConfigured = true;
};
