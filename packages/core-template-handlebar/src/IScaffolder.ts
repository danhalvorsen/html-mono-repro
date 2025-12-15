import { ScaffoldingBlueprint } from './ScaffoldingBlueprint.js';

export interface IScaffolder {
  scaffold(blueprint: ScaffoldingBlueprint): void;
}