import { IFragmentFactory } from "./IFragmentFactory.js";
import { ITextFragment } from "./ITextFragment.js";
import { TextFragment } from "./TextFragment.js";


export class TextFragmentFactory
    implements IFragmentFactory<ITextFragment, TextFragment> {
    public create(source: ITextFragment, index: number): TextFragment {
        return TextFragment.fromSource(source, index);
    }
}
