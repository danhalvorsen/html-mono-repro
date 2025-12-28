import { PrimitiveStyle } from "../base/PrimitiveStyle";

export class Fills {
  private _element: SVGElement;
  constructor(element: SVGElement) {
    this._element = element;
  }

  set setDefault(style: PrimitiveStyle) {
    this._element.setAttribute("fill", style.fill ?? "");
  }
}
