import { IPdfTextFragment } from "./IPdfTextFragment.js";
import { IPdfPageText } from "./IPdfPageText.js";

export interface IPdfPage {
    readonly pageNumber: number;

    readTextFragments(): Promise<readonly IPdfTextFragment[]>;

    readText(): Promise<IPdfPageText>;
}
