import type { GameObjectColorTheme, IColorManagedGameObject } from "./IColorManagedGameObject.js";

export interface ISlotColorDistributor {
  apply(host: HTMLElement, theme: GameObjectColorTheme): void;
}

function isColorManagedGameObject(value: Element): value is Element & IColorManagedGameObject {
  const candidate = value as Partial<IColorManagedGameObject>;
  return typeof candidate.applyColorTheme === "function";
}

export class SlotColorDistributor implements ISlotColorDistributor {
  public apply(host: HTMLElement, theme: GameObjectColorTheme): void {
    const slot = host.shadowRoot?.querySelector("slot");

    if (!(slot instanceof HTMLSlotElement)) {
      return;
    }

    const elements = slot.assignedElements({ flatten: true });

    for (const element of elements) {
      if (!isColorManagedGameObject(element)) {
        continue;
      }

      element.applyColorTheme(theme);
    }
  }
}