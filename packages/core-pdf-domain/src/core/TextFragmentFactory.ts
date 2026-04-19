
import type { IFragmentFactory } from "./IFragmentFactory.js";
import type { IPdfTextFragment } from "../pdf-domain/IPdfTextFragment.js";
import { TextFragment } from "./TextFragment.js";

export class TextFragmentFactory
  implements IFragmentFactory<IPdfTextFragment, TextFragment>
{
  public create(source: IPdfTextFragment, index: number): TextFragment {
    return TextFragment.fromSource(source, index);
  }
}
