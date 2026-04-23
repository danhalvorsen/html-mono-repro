import type { IPdfImageFragment } from "./IPdfImageFragment.js";
import type { IPdfFragmentBase } from "./IPdfFragmentBase.js";
import type { IPdfRectangleFragment } from "./IPdfRectangleFragment.js";
import type { IPdfTextFragment } from "./IPdfTextFragment.js";

export type IPdfFragment =
  | IPdfTextFragment
  | IPdfImageFragment
  | IPdfRectangleFragment;

export type AnyPdfFragmentBase = IPdfFragmentBase;
