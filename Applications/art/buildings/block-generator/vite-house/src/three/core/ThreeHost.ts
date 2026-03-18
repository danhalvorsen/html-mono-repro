export interface IThreeHost {
  getContainer(): HTMLElement;
  getViewportWidth(): number;
  getViewportHeight(): number;
  attachCanvas(canvas: HTMLCanvasElement): void;
}

export class ThreeHost implements IThreeHost {
    public constructor(private readonly container: HTMLElement) { }

    public getContainer(): HTMLElement {
        return this.container;
    }

    public getViewportWidth(): number {
        return Math.max(1, this.container.clientWidth || window.innerWidth);
    }

    public getViewportHeight(): number {
        return Math.max(1, this.container.clientHeight || window.innerHeight);
    }

    public attachCanvas(canvas: HTMLCanvasElement): void {
        if (!this.container.contains(canvas)) {
            this.container.appendChild(canvas);
        }
    }
}
