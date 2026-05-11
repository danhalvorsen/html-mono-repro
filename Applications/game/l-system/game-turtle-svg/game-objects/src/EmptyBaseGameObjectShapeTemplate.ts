import { html, type TemplateResult } from "lit";
import { BaseGameObjectShapeTemplate } from "./BaseGameObjectShapeTemplate";

export class EmptyBaseGameObjectShapeTemplate extends BaseGameObjectShapeTemplate {
  public   render(): TemplateResult {
    return html``;
  }
}
