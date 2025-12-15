// src/utils/interpolate.ts
import { inspect } from "util";
import chalk from "chalk";

export type InterpolateParams = Record<string, any>;

export function interpolateTemplate(
  template: string,
  params?: InterpolateParams
): string {
  if (!params) return template;

  return template.replace(/\{([^}]+)\}/g, (_, key) => {
    const value = params[key];

    if (value === undefined) {
      return `{${key}}`;
    }

    return chalk.cyanBright(
      inspect(value, {
        depth: 2,
        breakLength: 100,
        colors: false
      })
    );
  });
}
