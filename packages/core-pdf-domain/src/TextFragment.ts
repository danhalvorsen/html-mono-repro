import { FragmentKind } from "./FragmentKind.js";
import { ITextFragment } from "./ITextFragment.js";
import { Font } from "./Font.js";
import { Fragment } from "./Fragment.js";
import { Rectangle } from "./Rectangle.js";


export class TextFragment extends Fragment {
    public readonly text: string;
    public readonly font: Font;

    private constructor(params: {
        index: number;
        pageNumber: number;
        rectangle: Rectangle;
        text: string;
        font: Font;
    }) {
        super({
            index: params.index,
            pageNumber: params.pageNumber,
            rectangle: params.rectangle,
        });

        this.text = params.text;
        this.font = params.font;
    }

    public static create(params: {
        index: number;
        pageNumber: number;
        rectangle: Rectangle;
        text: string;
        font?: Font;
    }): TextFragment {
        return new TextFragment({
            index: params.index,
            pageNumber: params.pageNumber,
            rectangle: params.rectangle,
            text: params.text,
            font: params.font ?? Font.create(),
        });
    }

    public static fromSource(source: ITextFragment, index: number): TextFragment {
        return new TextFragment({
            index,
            pageNumber: source.pageNumber,
            rectangle: Rectangle.create({
                id: `p${source.pageNumber}-${index}`,
                position: source.boundingBox.position,
                width: source.boundingBox.width,
                height: source.boundingBox.height,
            }),
            text: source.text,
            font: Font.create({
                raw: source.font,
                name: source.fontName,
                family: source.fontFamily,
                size: source.fontSize,
            }),
        });
    }

    public override get kind(): FragmentKind {
        return "text";
    }

    public get textLength(): number {
        return this.text.length;
    }

    public withText(text: string): TextFragment {
        return new TextFragment({
            index: this.index,
            pageNumber: this.pageNumber,
            rectangle: this.rectangle,
            text,
            font: this.font,
        });
    }

    public withFont(font: Font): TextFragment {
        return new TextFragment({
            index: this.index,
            pageNumber: this.pageNumber,
            rectangle: this.rectangle,
            text: this.text,
            font,
        });
    }

    public toSource(): ITextFragment {
        return Object.freeze({
            pageNumber: this.pageNumber,
            text: this.text,
            boundingBox: this.rectangle.toBoundingBox(),
            font: this.font.raw ?? undefined,
            fontName: this.font.name,
            fontFamily: this.font.family,
            fontSize: this.font.size,
        });
    }

    protected override withRectangle(rectangle: Rectangle): TextFragment {
        return new TextFragment({
            index: this.index,
            pageNumber: this.pageNumber,
            rectangle,
            text: this.text,
            font: this.font,
        });
    }
}
