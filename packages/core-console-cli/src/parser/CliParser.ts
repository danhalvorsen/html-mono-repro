import { parseArgs } from 'node:util';
import { tokenizeInput } from './tokenizer.js';

export type CliOptionType = 'string' | 'boolean' | 'number';
export type CliOptionValue = string | boolean | number;
export type CliOptionParsedValue = CliOptionValue | CliOptionValue[] | undefined;

// node:util parseArgs option typing (ParseArgsOptionConfig/ParseArgsOptionsConfig)
// are not exported from @types/node, so we mirror them structurally here.
type NodeOptionType = 'string' | 'boolean';
interface NodeOptionConfig {
  type: NodeOptionType;
  multiple?: boolean;
  short?: string;
  default?: string | boolean | string[] | boolean[];
}
type NodeOptionsConfig = Record<string, NodeOptionConfig>;

export interface CliOptionDefinition {
  type: CliOptionType;
  short?: string;
  multiple?: boolean;
  default?: CliOptionValue;
  description?: string;
}

export type CliOptionSchema = Record<string, CliOptionDefinition>;

export interface CliSplit {
  command?: string;
  args: string[];
}

export interface CliParsedOptions {
  options: Record<string, CliOptionParsedValue>;
  positionals: string[];
}

export interface CliParsedInvocation extends CliParsedOptions {
  command?: string;
  args: string[];
}

function toNodeOptionType(type: CliOptionType): NodeOptionType {
  return type === 'number' ? 'string' : type;
}

function toNodeDefaultValue(def: CliOptionDefinition): NodeOptionConfig['default'] {
  if (def.default === undefined) return undefined;
  if (def.type === 'number') {
    const str = String(def.default);
    return def.multiple ? [str] : str;
  }
  if (def.type === 'string') return def.multiple ? [String(def.default)] : String(def.default);
  return def.multiple ? [Boolean(def.default)] : Boolean(def.default);
}

function toNodeOptions(schema: CliOptionSchema): NodeOptionsConfig {
  const options: NodeOptionsConfig = {};
  for (const [name, def] of Object.entries(schema)) {
    options[name] = {
      type: toNodeOptionType(def.type),
      short: def.short,
      multiple: def.multiple,
      default: toNodeDefaultValue(def),
    };
  }
  return options;
}

function coerceNumber(value: unknown, optionName: string): number {
  const num = Number(value);
  if (Number.isNaN(num)) {
    throw new Error(`Invalid value for --${optionName}: expected a number, got ${JSON.stringify(value)}`);
  }
  return num;
}

export class CliParser {
  split(rawInput: string | string[]): CliSplit {
    const tokens = Array.isArray(rawInput)
      ? rawInput.filter(Boolean)
      : tokenizeInput(rawInput);
    const copy = [...tokens];
    const command = copy.shift();
    return { command, args: copy };
  }

  parseOptions(args: string[], schema: CliOptionSchema = {}): CliParsedOptions {
    const { values, positionals } = parseArgs({
      args,
      options: toNodeOptions(schema),
      strict: false,
      allowPositionals: true,
    });

    const options: Record<string, CliOptionParsedValue> = { ...values };
    for (const [name, def] of Object.entries(schema)) {
      if (def.type !== 'number') continue;
      const raw = options[name];
      if (raw === undefined) continue;
      options[name] = Array.isArray(raw)
        ? raw.map((v) => coerceNumber(v, name))
        : coerceNumber(raw, name);
    }

    return {
      options,
      positionals,
    };
  }

  parse(rawInput: string | string[], schema: CliOptionSchema = {}): CliParsedInvocation {
    const split = this.split(rawInput);
    const parsed = this.parseOptions(split.args, schema);
    return {
      command: split.command,
      args: split.args,
      ...parsed,
    };
  }
}
