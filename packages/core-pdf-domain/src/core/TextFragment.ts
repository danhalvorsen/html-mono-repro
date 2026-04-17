 
import type { ITextFragment } from "./ITextFragment.js";            
import { Rectangle } from "./Rectangle.js";
import { Fragment } from "./Fragment.js";           
import type { IFragmentFactory } from "./IFragmentFactory.js";              
import type { IPdfTextFragment } from "../pdf-domain/IPdfTextFragment.js";                          
import { FragmentKind } from "./FragmentKind.js";
export class TextFragment extends Fragment<TextFragment> {
    public readonly text: string;
    public readonly fontName: string | undefined;
    public readonly fontFamily: string | undefined;
    public readonly fontSize: number | undefined;

    public constructor(params: {
        index: number;
        pageNumber: number;
        rectangle: Rectangle;
        text: string;
        fontName?: string | null | undefined;
        fontFamily?: string | null | undefined;
        fontSize?: number | null | undefined;
    }) {
        super({
            index: params.index,
            pageNumber: params.pageNumber,
            rectangle: params.rectangle
        });

        this.text = params.text;
        this.fontName = params.fontName ?? undefined;
        this.fontFamily = params.fontFamily ?? undefined;
        this.fontSize = params.fontSize ?? undefined;
    }

    public static fromSource(source: IPdfTextFragment, index: number): TextFragment {
        const params: {
            index: number;
            pageNumber: number;
            rectangle: Rectangle;
            text: string;
            fontName?: string;
            fontFamily?: string;
            fontSize?: number;
        } = {
            index,
            pageNumber: source.pageNumber,
            rectangle: Rectangle.fromTextFragment(source, index),
            text: source.text
        };

        if (source.fontName !== null && source.fontName !== undefined) {
            params.fontName = source.fontName;
        }

        if (source.fontFamily !== null && source.fontFamily !== undefined) {
            params.fontFamily = source.fontFamily;
        }

        if (source.fontSize !== null && source.fontSize !== undefined) {
            params.fontSize = source.fontSize;
        }

        return new TextFragment(params);
    }

    public get kind(): FragmentKind {
        return "text";
    }

    public withText(text: string): TextFragment {
        return new TextFragment({
            index: this.index,
            pageNumber: this.pageNumber,
            rectangle: this.rectangle,
            text,
            fontName: this.fontName ?? undefined,
            fontFamily: this.fontFamily ?? undefined,
            fontSize: this.fontSize ?? undefined
        });
    }

    public withFont(params: {
        fontName?: string | null;
        fontFamily?: string | null;
        fontSize?: number | null;
    }): TextFragment {
        return new TextFragment({
            index: this.index,
            pageNumber: this.pageNumber,
            rectangle: this.rectangle,
            text: this.text,
            fontName: params.fontName === undefined ? this.fontName : params.fontName,
            fontFamily: params.fontFamily === undefined ? this.fontFamily : params.fontFamily,
            fontSize: params.fontSize === undefined ? this.fontSize : params.fontSize
        });
    }

    public toSource(): IPdfTextFragment {
        return Object.freeze({
            kind: "text",
            pageNumber: this.pageNumber,
            text: this.text,
            boundingBox: this.rectangle.toBoundingBox(),
            ...(this.fontName !== undefined && { fontName: this.fontName }),
            ...(this.fontFamily !== undefined && { fontFamily: this.fontFamily }),
            ...(this.fontSize !== undefined && { fontSize: this.fontSize })
        });
    }

    protected withRectangle(rectangle: Rectangle): TextFragment {
        return new TextFragment({
            index: this.index,
            pageNumber: this.pageNumber,
            rectangle,
            text: this.text,
            fontName: this.fontName ?? undefined,
            fontFamily: this.fontFamily ?? undefined,
            fontSize: this.fontSize ?? undefined
        });
    }
}