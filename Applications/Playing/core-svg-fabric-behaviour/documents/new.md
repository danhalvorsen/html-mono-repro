You’re right. Here is a **prime**, spec-aligned approach: **no `render()` hack, no wrapper div, no loose public callback field**.

```ts
// Applications/Playing/core-svg-fabric-products/src/domain/product-shape-events.ts

import type { ProductShapeStyleTokenName } from "../style/product-shape-style-tokens.js";

export const ProductShapeEventName = Object.freeze({
  BoxClick: "product-shape-box-click",
} as const);

export interface BoxClickDetail {
  readonly width: number;
  readonly height: number;
  readonly token: ProductShapeStyleTokenName;
}
```

```ts
// Applications/Playing/core-svg-fabric-products/src/application/product-shape-click-behavior.ts

import { ProductShapeEventName, type BoxClickDetail } from "../domain/product-shape-events.js";
import type { ProductShapeStyleTokenName } from "../style/product-shape-style-tokens.js";

export interface IHostClickBehavior {
  connect(host: EventTarget): void;
  disconnect(host: EventTarget): void;
}

export interface BoxClickStateProvider {
  getBoxClickDetail(): BoxClickDetail;
}

export class DispatchBoxClickBehavior implements IHostClickBehavior {
  private readonly onClick: EventListener;

  public constructor(
    private readonly detailProvider: BoxClickStateProvider,
  ) {
    this.onClick = this.handleClick as EventListener;
  }

  public connect(host: EventTarget): void {
    host.addEventListener("click", this.onClick);
  }

  public disconnect(host: EventTarget): void {
    host.removeEventListener("click", this.onClick);
  }

  private handleClick = (): void => {
    const host = this.detailProvider as unknown as EventTarget;
    const detail = this.detailProvider.getBoxClickDetail();

    host.dispatchEvent(
      new CustomEvent<BoxClickDetail>(ProductShapeEventName.BoxClick, {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  };
}
```

```ts
// Applications/Playing/core-svg-fabric-products/src/components/svg-fabric-box/svg-fabric-box.ts

import { type SvgRootNode } from "@monorepo/core-svg-fabric";
import { type PropertyDeclarations } from "lit";
import { createBoxShapeRootNode } from "../../composition/product-shape-node-factory.js";
import { ProductShapeElementTag } from "../../domain/product-shape-contracts.js";
import type { BoxClickDetail } from "../../domain/product-shape-events.js";
import {
  DispatchBoxClickBehavior,
  type BoxClickStateProvider,
  type IHostClickBehavior,
} from "../../application/product-shape-click-behavior.js";
import {
  ProductShapeStyleToken,
  type ProductShapeStyleTokenName,
} from "../../style/product-shape-style-tokens.js";
import { ProductShapeElement } from "../product-shape-element/product-shape-element.js";

export class SvgFabricBoxElement
  extends ProductShapeElement
  implements BoxClickStateProvider
{
  public static override properties: PropertyDeclarations = {
    width: { type: Number },
    height: { type: Number },
  };

  public declare width: number;
  public declare height: number;
  public declare token: ProductShapeStyleTokenName;

  private readonly clickBehavior: IHostClickBehavior;

  public constructor(
    clickBehavior: IHostClickBehavior = new DispatchBoxClickBehavior(
      // Constructor injection keeps behavior replaceable and testable.
      undefined as unknown as BoxClickStateProvider,
    ),
  ) {
    super();
    this.width = 96;
    this.height = 72;
    this.token = ProductShapeStyleToken.Box;

    this.clickBehavior =
      clickBehavior instanceof DispatchBoxClickBehavior
        ? new DispatchBoxClickBehavior(this)
        : clickBehavior;
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.clickBehavior.connect(this);
  }

  public override disconnectedCallback(): void {
    this.clickBehavior.disconnect(this);
    super.disconnectedCallback();
  }

  public override renderNode(): SvgRootNode {
    return createBoxShapeRootNode({
      width: this.width,
      height: this.height,
      style: this.styleInput,
    });
  }

  public getBoxClickDetail(): BoxClickDetail {
    return {
      width: this.width,
      height: this.height,
      token: this.token,
    };
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get(ProductShapeElementTag.Box)
) {
  customElements.define(ProductShapeElementTag.Box, SvgFabricBoxElement);
}

declare global {
  interface HTMLElementTagNameMap {
    "svg-fabric-box": SvgFabricBoxElement;
  }
}
```

```ts
// consumer usage

import { ProductShapeEventName, type BoxClickDetail } from "../../domain/product-shape-events.js";
import "./svg-fabric-box.js";

const box = document.createElement("svg-fabric-box");

box.addEventListener(ProductShapeEventName.BoxClick, (event) => {
  const { detail } = event as CustomEvent<BoxClickDetail>;
  console.log(detail.width, detail.height, detail.token);
});

document.body.appendChild(box);
```

Why this is the right shape:

* `renderNode()` stays pure.
* No `render()` override.
* No wrapper DOM.
* No magic custom event string inline.
* Interaction is composed through a behavior object.
* The component remains a host adapter plus state provider, not a template hack.
* The click mechanism is reusable across other product components.
