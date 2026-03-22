import type { IResizeAware } from "./IResizeAware";
import type { IResizeController } from "./IResizeController";
 
import type { IViewportSource } from "./IViewportSource";

export class ResizeController implements IResizeController {
    private readonly onResizeBound: () => void;

    public constructor(
        private readonly viewport: IViewportSource,
        private readonly targets: readonly IResizeAware[]
    ) {
        this.onResizeBound = () => this.resizeAll();
    }

    public connect(): void {
        window.addEventListener("resize", this.onResizeBound);
        this.resizeAll();
    }

    public disconnect(): void {
        window.removeEventListener("resize", this.onResizeBound);
    }

    private resizeAll(): void {
        const width = this.viewport.getViewportWidth();
        const height = this.viewport.getViewportHeight();

        for (const target of this.targets) {
            target.resize(width, height);
        }
    }
}
