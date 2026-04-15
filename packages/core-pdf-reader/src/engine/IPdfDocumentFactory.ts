import openapiTS from 'openapi-typescript';
import { IPdfDocument } from './IPdfDocument .js';
export interface IPdfDocumentFactory {
  open(binary: Uint8Array): Promise<IPdfDocument>;
}
