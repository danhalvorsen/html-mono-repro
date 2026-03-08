import fs from "node:fs/promises";
import path from "node:path";
import type { ExampleResponse, ExampleType } from "./types/index.js";

export function buildExampleResponse(data: readonly ExampleType[]): ExampleResponse {
  return {
    success: true,
    data: [...data],
  };
}

export async function loadExampleData(filePath: string): Promise<ExampleResponse> {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as ExampleType[];
  return buildExampleResponse(parsed);
}

export async function writeExampleData(
  directory: string,
  fileName: string,
  data: readonly ExampleType[],
): Promise<string> {
  await fs.mkdir(directory, { recursive: true });
  const fullPath = path.join(directory, fileName);
  await fs.writeFile(fullPath, JSON.stringify(data, null, 2), "utf8");
  return fullPath;
}
