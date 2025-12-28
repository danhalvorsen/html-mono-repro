import type { CliActionDefinition } from '../types.js';

export class CommandRegistry {
  private readonly commands = new Map<string, CliActionDefinition<unknown, unknown>>();

  register(definition: CliActionDefinition<unknown, unknown>): void {
    this.record(definition.name, definition);
    for (const alias of definition.aliases ?? []) {
      this.record(alias, definition);
    }
  }

  get(name?: string): CliActionDefinition<unknown, unknown> | undefined {
    if (!name) return undefined;
    return this.commands.get(name);
  }

  list(): CliActionDefinition<unknown, unknown>[] {
    const unique = new Set<CliActionDefinition<unknown, unknown>>();
    for (const def of this.commands.values()) {
      unique.add(def);
    }
    return Array.from(unique);
  }

  private record(key: string, definition: CliActionDefinition<unknown, unknown>) {
    if (this.commands.has(key)) {
      throw new Error(`CLI action already registered for "${key}"`);
    }
    this.commands.set(key, definition);
  }
}
