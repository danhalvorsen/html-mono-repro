// src/components/contracts/WebPartView.ts
import type { TemplateResult } from "lit";
 
export interface IWebCardView {
  readonly title: string;

  buildHeader(): TemplateResult;
  buildMain(): TemplateResult;
  buildFooter(): TemplateResult;
}
export interface WebPartView {
  readonly header: TemplateResult;
  readonly main: TemplateResult;
  readonly footer: TemplateResult;
}