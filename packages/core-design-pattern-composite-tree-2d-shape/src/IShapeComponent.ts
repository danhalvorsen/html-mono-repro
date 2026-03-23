import type { IComponent } from "@monorepo/core-design-pattern-composite-tree";
import { afterEach } from 'vitest';

export interface IShapeComponent extends IComponent<IShapeComponent> {
  area(): number;
}