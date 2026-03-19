// ====================================================================================
// FILE: src/three/core/scene/SceneMenu.ts
// REPLACE THE WHOLE FILE
// ====================================================================================

import type { IUpdatable } from "../IUpdatable.js";

type DisposableUpdatable = IUpdatable & {
  dispose?: () => void;
};

type SceneFactory = () => DisposableUpdatable;

type SceneRegistration = Readonly<{
  name: string;
  factory: SceneFactory;
}>;

export class SceneMenu {
  private readonly scenes: SceneRegistration[] = [];
  private active: DisposableUpdatable | null = null;
  private onKeyDownBound: ((event: KeyboardEvent) => void) | null = null;

  public register(name: string, factory: SceneFactory): void {
    this.scenes.push({ name, factory });
  }

  public mount(container: HTMLElement): void {
    const wrapper = document.createElement("div");
    wrapper.style.position = "absolute";
    wrapper.style.top = "10px";
    wrapper.style.left = "10px";
    wrapper.style.zIndex = "1000";
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.gap = "4px";
    wrapper.style.padding = "8px";
    wrapper.style.background = "rgba(17,17,17,0.85)";
    wrapper.style.borderRadius = "6px";
    wrapper.style.fontFamily = "monospace";

    this.scenes.forEach((scene, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `[${index + 1}] ${scene.name}`;
      button.onclick = () => this.activate(index);
      wrapper.appendChild(button);
    });

    container.appendChild(wrapper);

    this.onKeyDownBound = (event: KeyboardEvent): void => {
      if (event.repeat) {
        return;
      }

      const index = this.tryParseIndex(event.key);
      if (index === null) {
        return;
      }

      if (index >= this.scenes.length) {
        return;
      }

      this.activate(index);
    };

    window.addEventListener("keydown", this.onKeyDownBound);
  }

  public dispose(): void {
    if (this.onKeyDownBound !== null) {
      window.removeEventListener("keydown", this.onKeyDownBound);
      this.onKeyDownBound = null;
    }

    this.active?.dispose?.();
    this.active = null;
  }

  public activate(index: number): void {
    const registration = this.scenes[index];
    if (registration === undefined) {
      throw new Error(`Scene index out of range: ${index}`);
    }

    this.active?.dispose?.();
    this.active = registration.factory();
  }

  public getActive(): DisposableUpdatable | null {
    return this.active;
  }

  private tryParseIndex(key: string): number | null {
    if (!/^[1-9]$/.test(key)) {
      return null;
    }

    return Number.parseInt(key, 10) - 1;
  }
}