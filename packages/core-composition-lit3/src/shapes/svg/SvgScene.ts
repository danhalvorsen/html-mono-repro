import { ISvgObject } from "./ISvgObject";

export interface SvgSceneOptions {
  /** If true, scene will call update() after add/remove. */
  autoUpdate?: boolean;
}

export class SvgScene {
  private readonly objects = new Map<string, ISvgObject>();
  private host?: SVGSVGElement;

  private readonly autoUpdate: boolean;

  public constructor(options: SvgSceneOptions = {}) {
    this.autoUpdate = options.autoUpdate ?? true;
  }

  public mount(svg: SVGSVGElement): void {
    this.host = svg;

    // Mount existing objects
    for (const obj of this.objects.values()) {
      svg.appendChild(obj.create());
      if (this.autoUpdate) obj.update();
    }
  }

  public unmount(): void {
    if (!this.host) return;

    // Remove nodes but keep objects (scene can be remounted)
    const svg = this.host;
    for (const obj of this.objects.values()) {
      const node = obj.create();
      if (node.parentNode === svg) svg.removeChild(node);
    }
    this.host = undefined;
  }

  public add(obj: ISvgObject): void {
    if (this.objects.has(obj.id)) {
      throw new Error(`SvgScene.add: object with id '${obj.id}' already exists.`);
    }

    this.objects.set(obj.id, obj);

    if (this.host) {
      this.host.appendChild(obj.create());
      if (this.autoUpdate) obj.update();
    }
  }

  public remove(id: string): boolean {
    const obj = this.objects.get(id);
    if (!obj) return false;

    const node = obj.create();
    if (this.host && node.parentNode === this.host) {
      this.host.removeChild(node);
    }

    obj.destroy?.();
    this.objects.delete(id);
    return true;
  }

  public get<T extends ISvgObject = ISvgObject>(id: string): T | undefined {
    return this.objects.get(id) as T | undefined;
  }

  public updateAll(): void {
    for (const obj of this.objects.values()) obj.update();
  }
}