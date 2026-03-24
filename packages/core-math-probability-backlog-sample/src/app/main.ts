import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { SampleBacklogAnalysisRunner } from "./SampleBacklogAnalysisRunner.js";
import type { IBacklogRootJson } from "../json/IBacklogRootJson.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = resolve(
  __dirname,
  "../../tests/backlog.oscillator-engine-core.json",
);

const backlog = JSON.parse(
  readFileSync(filePath, "utf8"),
) as IBacklogRootJson;

const app = new SampleBacklogAnalysisRunner();
const result = app.run(backlog);

console.log(result.markdown);