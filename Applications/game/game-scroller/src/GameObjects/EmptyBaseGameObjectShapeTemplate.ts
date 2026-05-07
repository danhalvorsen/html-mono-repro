import { html, type TemplateResult } from "lit";
import { BaseGameObjectShapeTemplate } from "./BaseGameObjectShapeTemplate.js";

export class EmptyBaseGameObjectShapeTemplate extends BaseGameObjectShapeTemplate {
  public override render(): TemplateResult {
    return html``;
  }
}
