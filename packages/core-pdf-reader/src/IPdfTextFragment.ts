// src/IPdfTextFragment.ts

export interface IPdfTextFragment {
  readonly pageNumber: number;
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}