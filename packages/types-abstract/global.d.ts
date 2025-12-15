// src/types/global.d.ts
export {};

declare global {
  // Narrower global properties for test environment
  var window: import {  } from "module";("jsdom").DOMWindow & typeof globalThis;
  var document: Document & typeof globalThis.document;
  var navigator: Navigator & typeof globalThis.navigator;
}
