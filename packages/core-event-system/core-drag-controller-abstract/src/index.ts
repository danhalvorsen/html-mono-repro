
    export interface Position {
        readonly x: number;
        readonly y: number;
    }

    export class TimeStamp {
        private constructor(private readonly value: number) {}

        static now(): TimeStamp {
            return new TimeStamp(performance.now());
        }

        toNumber(): number {
            return this.value;
        }

        toString(): string {
            return `TimeStamp(${this.value})`;
        }
    }

    export type EventName = string & { readonly __brand: unique symbol };

    export function defineEventName<T extends string>(name: T): EventName {
        return name as EventName;
    }


    export namespace Event {
        export namespace Common {

            export interface ICommonEventData {
                readonly event: EventName;
            }

            export interface ICommonEvent<TData extends ICommonEventData> {
                readonly name: EventName;
                readonly timestamp: TimeStamp;
                readonly data: TData;
                dispose(): void;
            }

            export class CommonEvent<TData extends ICommonEventData>
                implements ICommonEvent<TData>
            {
                private disposed = false;

                constructor(
                    public readonly name: EventName,
                    public readonly timestamp: TimeStamp,
                    public readonly data: TData
                ) {}

                dispose(): void {
                    if (this.disposed) return;
                    (this as any).data = null;
                    this.disposed = true;
                }
            }

            export interface ICommonEventHandler<TData extends ICommonEventData> {
                handle(evt: ICommonEvent<TData>): void | Promise<void>;
            }
        }
    }


    export namespace Mouse {
        export namespace Controller {

            export interface IMouseController {
                onMove(handler: (pos: Position) => void): void;
                onDown(handler: (pos: Position) => void): void;
                onUp(handler: (pos: Position) => void): void;
                onWheel(handler: (delta: number, pos: Position) => void): void;
                dispose(): void;
            }

            export abstract class BaseMouseController implements IMouseController {

                private readonly moveHandlers  = new Set<(pos: Position) => void>();
                private readonly downHandlers  = new Set<(pos: Position) => void>();
                private readonly upHandlers    = new Set<(pos: Position) => void>();
                private readonly wheelHandlers = new Set<(delta: number, pos: Position) => void>();

                onMove(handler: (pos: Position) => void): void {
                    this.moveHandlers.add(handler);
                }

                onDown(handler: (pos: Position) => void): void {
                    this.downHandlers.add(handler);
                }

                onUp(handler: (pos: Position) => void): void {
                    this.upHandlers.add(handler);
                }

                onWheel(handler: (delta: number, pos: Position) => void): void {
                    this.wheelHandlers.add(handler);
                }

                protected emitMove(pos: Position): void {
                    for (const h of this.moveHandlers) h(pos);
                }

                protected emitDown(pos: Position): void {
                    for (const h of this.downHandlers) h(pos);
                }

                protected emitUp(pos: Position): void {
                    for (const h of this.upHandlers) h(pos);
                }

                protected emitWheel(delta: number, pos: Position): void {
                    for (const h of this.wheelHandlers) h(delta, pos);
                }

                abstract dispose(): void;
            }
        }
    }


    export namespace Drag {
        export namespace Controller {

            export interface IDragStartData extends Event.Common.ICommonEventData {
                readonly start: Position;
            }

            export interface IDragMoveData extends Event.Common.ICommonEventData {
                readonly start: Position;
                readonly current: Position;
                readonly delta: Position;
            }

            export interface IDragEndData extends Event.Common.ICommonEventData {
                readonly start: Position;
                readonly end: Position;
            }

            export interface IDragController {
                onDragStart(
                    handler: (evt: Event.Common.ICommonEvent<IDragStartData>) => void
                ): void;

                onDragMove(
                    handler: (evt: Event.Common.ICommonEvent<IDragMoveData>) => void
                ): void;

                onDragEnd(
                    handler: (evt: Event.Common.ICommonEvent<IDragEndData>) => void
                ): void;

                dispose(): void;
            }

            export abstract class BaseDragController implements IDragController {

                private startHandlers = new Set<(e: Event.Common.ICommonEvent<IDragStartData>) => void>();
                private moveHandlers  = new Set<(e: Event.Common.ICommonEvent<IDragMoveData>) => void>();
                private endHandlers   = new Set<(e: Event.Common.ICommonEvent<IDragEndData>) => void>();

                onDragStart(handler: (evt: Event.Common.ICommonEvent<IDragStartData>) => void): void {
                    this.startHandlers.add(handler);
                }

                onDragMove(handler: (evt: Event.Common.ICommonEvent<IDragMoveData>) => void): void {
                    this.moveHandlers.add(handler);
                }

                onDragEnd(handler: (evt: Event.Common.ICommonEvent<IDragEndData>) => void): void {
                    this.endHandlers.add(handler);
                }

                protected emitStart(evt: Event.Common.ICommonEvent<IDragStartData>): void {
                    for (const h of this.startHandlers) h(evt);
                }

                protected emitMove(evt: Event.Common.ICommonEvent<IDragMoveData>): void {
                    for (const h of this.moveHandlers) h(evt);
                }

                protected emitEnd(evt: Event.Common.ICommonEvent<IDragEndData>): void {
                    for (const h of this.endHandlers) h(evt);
                }

                abstract dispose(): void;
            }
        }
    }
}

namespace Foo.Frame {

    export interface Position {
        readonly x: number;
        readonly y: number;
    }

    export class TimeStamp {
        private constructor(private readonly value: number) {}

        static now(): TimeStamp {
            return new TimeStamp(performance.now());
        }

        toNumber(): number {
            return this.value;
        }

        toString(): string {
            return `TimeStamp(${this.value})`;
        }
    }

    export type EventName = string & { readonly __brand: unique symbol };

    export function defineEventName<T extends string>(name: T): EventName {
        return name as EventName;
    }


    export namespace Event {
        export namespace Common {

            export interface ICommonEventData {
                readonly event: EventName;
            }

            export interface ICommonEvent<TData extends ICommonEventData> {
                readonly name: EventName;
                readonly timestamp: TimeStamp;
                readonly data: TData;
                dispose(): void;
            }

            export class CommonEvent<TData extends ICommonEventData>
                implements ICommonEvent<TData>
            {
                private disposed = false;

                constructor(
                    public readonly name: EventName,
                    public readonly timestamp: TimeStamp,
                    public readonly data: TData
                ) {}

                dispose(): void {
                    if (this.disposed) return;
                    (this as any).data = null;
                    this.disposed = true;
                }
            }

            export interface ICommonEventHandler<TData extends ICommonEventData> {
                handle(evt: ICommonEvent<TData>): void | Promise<void>;
            }
        }
    }


    export namespace Mouse {
        export namespace Controller {

            export interface IMouseController {
                onMove(handler: (pos: Position) => void): void;
                onDown(handler: (pos: Position) => void): void;
                onUp(handler: (pos: Position) => void): void;
                onWheel(handler: (delta: number, pos: Position) => void): void;
                dispose(): void;
            }

            export abstract class BaseMouseController implements IMouseController {

                private readonly moveHandlers  = new Set<(pos: Position) => void>();
                private readonly downHandlers  = new Set<(pos: Position) => void>();
                private readonly upHandlers    = new Set<(pos: Position) => void>();
                private readonly wheelHandlers = new Set<(delta: number, pos: Position) => void>();

                onMove(handler: (pos: Position) => void): void {
                    this.moveHandlers.add(handler);
                }

                onDown(handler: (pos: Position) => void): void {
                    this.downHandlers.add(handler);
                }

                onUp(handler: (pos: Position) => void): void {
                    this.upHandlers.add(handler);
                }

                onWheel(handler: (delta: number, pos: Position) => void): void {
                    this.wheelHandlers.add(handler);
                }

                protected emitMove(pos: Position): void {
                    for (const h of this.moveHandlers) h(pos);
                }

                protected emitDown(pos: Position): void {
                    for (const h of this.downHandlers) h(pos);
                }

                protected emitUp(pos: Position): void {
                    for (const h of this.upHandlers) h(pos);
                }

                protected emitWheel(delta: number, pos: Position): void {
                    for (const h of this.wheelHandlers) h(delta, pos);
                }

                abstract dispose(): void;
            }
        }
    }


    export namespace Drag {
        export namespace Controller {

            export interface IDragStartData extends Event.Common.ICommonEventData {
                readonly start: Position;
            }

            export interface IDragMoveData extends Event.Common.ICommonEventData {
                readonly start: Position;
                readonly current: Position;
                readonly delta: Position;
            }

            export interface IDragEndData extends Event.Common.ICommonEventData {
                readonly start: Position;
                readonly end: Position;
            }

            export interface IDragController {
                onDragStart(
                    handler: (evt: Event.Common.ICommonEvent<IDragStartData>) => void
                ): void;

                onDragMove(
                    handler: (evt: Event.Common.ICommonEvent<IDragMoveData>) => void
                ): void;

                onDragEnd(
                    handler: (evt: Event.Common.ICommonEvent<IDragEndData>) => void
                ): void;

                dispose(): void;
            }

            export abstract class BaseDragController implements IDragController {

                private startHandlers = new Set<(e: Event.Common.ICommonEvent<IDragStartData>) => void>();
                private moveHandlers  = new Set<(e: Event.Common.ICommonEvent<IDragMoveData>) => void>();
                private endHandlers   = new Set<(e: Event.Common.ICommonEvent<IDragEndData>) => void>();

                onDragStart(handler: (evt: Event.Common.ICommonEvent<IDragStartData>) => void): void {
                    this.startHandlers.add(handler);
                }

                onDragMove(handler: (evt: Event.Common.ICommonEvent<IDragMoveData>) => void): void {
                    this.moveHandlers.add(handler);
                }

                onDragEnd(handler: (evt: Event.Common.ICommonEvent<IDragEndData>) => void): void {
                    this.endHandlers.add(handler);
                }

                protected emitStart(evt: Event.Common.ICommonEvent<IDragStartData>): void {
                    for (const h of this.startHandlers) h(evt);
                }

                protected emitMove(evt: Event.Common.ICommonEvent<IDragMoveData>): void {
                    for (const h of this.moveHandlers) h(evt);
                }

                protected emitEnd(evt: Event.Common.ICommonEvent<IDragEndData>): void {
                    for (const h of this.endHandlers) h(evt);
                }

                abstract dispose(): void;
            }
        }
    }
}

namespace Foo.Frame {

    export interface Position {
        readonly x: number;
        readonly y: number;
    }

    export class TimeStamp {
        private constructor(private readonly value: number) {}

        static now(): TimeStamp {
            return new TimeStamp(performance.now());
        }

        toNumber(): number {
            return this.value;
        }

        toString(): string {
            return `TimeStamp(${this.value})`;
        }
    }

    export type EventName = string & { readonly __brand: unique symbol };

    export function defineEventName<T extends string>(name: T): EventName {
        return name as EventName;
    }


    export namespace Event {
        export namespace Common {

            export interface ICommonEventData {
                readonly event: EventName;
            }

            export interface ICommonEvent<TData extends ICommonEventData> {
                readonly name: EventName;
                readonly timestamp: TimeStamp;
                readonly data: TData;
                dispose(): void;
            }

            export class CommonEvent<TData extends ICommonEventData>
                implements ICommonEvent<TData>
            {
                private disposed = false;

                constructor(
                    public readonly name: EventName,
                    public readonly timestamp: TimeStamp,
                    public readonly data: TData
                ) {}

                dispose(): void {
                    if (this.disposed) return;
                    (this as any).data = null;
                    this.disposed = true;
                }
            }

            export interface ICommonEventHandler<TData extends ICommonEventData> {
                handle(evt: ICommonEvent<TData>): void | Promise<void>;
            }
        }
    }


    export namespace Mouse {
        export namespace Controller {

            export interface IMouseController {
                onMove(handler: (pos: Position) => void): void;
                onDown(handler: (pos: Position) => void): void;
                onUp(handler: (pos: Position) => void): void;
                onWheel(handler: (delta: number, pos: Position) => void): void;
                dispose(): void;
            }

            export abstract class BaseMouseController implements IMouseController {

                private readonly moveHandlers  = new Set<(pos: Position) => void>();
                private readonly downHandlers  = new Set<(pos: Position) => void>();
                private readonly upHandlers    = new Set<(pos: Position) => void>();
                private readonly wheelHandlers = new Set<(delta: number, pos: Position) => void>();

                onMove(handler: (pos: Position) => void): void {
                    this.moveHandlers.add(handler);
                }

                onDown(handler: (pos: Position) => void): void {
                    this.downHandlers.add(handler);
                }

                onUp(handler: (pos: Position) => void): void {
                    this.upHandlers.add(handler);
                }

                onWheel(handler: (delta: number, pos: Position) => void): void {
                    this.wheelHandlers.add(handler);
                }

                protected emitMove(pos: Position): void {
                    for (const h of this.moveHandlers) h(pos);
                }

                protected emitDown(pos: Position): void {
                    for (const h of this.downHandlers) h(pos);
                }

                protected emitUp(pos: Position): void {
                    for (const h of this.upHandlers) h(pos);
                }

                protected emitWheel(delta: number, pos: Position): void {
                    for (const h of this.wheelHandlers) h(delta, pos);
                }

                abstract dispose(): void;
            }
        }
    }


    export namespace Drag {
        export namespace Controller {

            export interface IDragStartData extends Event.Common.ICommonEventData {
                readonly start: Position;
            }

            export interface IDragMoveData extends Event.Common.ICommonEventData {
                readonly start: Position;
                readonly current: Position;
                readonly delta: Position;
            }

            export interface IDragEndData extends Event.Common.ICommonEventData {
                readonly start: Position;
                readonly end: Position;
            }

            export interface IDragController {
                onDragStart(
                    handler: (evt: Event.Common.ICommonEvent<IDragStartData>) => void
                ): void;

                onDragMove(
                    handler: (evt: Event.Common.ICommonEvent<IDragMoveData>) => void
                ): void;

                onDragEnd(
                    handler: (evt: Event.Common.ICommonEvent<IDragEndData>) => void
                ): void;

                dispose(): void;
            }

            export abstract class BaseDragController implements IDragController {

                private startHandlers = new Set<(e: Event.Common.ICommonEvent<IDragStartData>) => void>();
                private moveHandlers  = new Set<(e: Event.Common.ICommonEvent<IDragMoveData>) => void>();
                private endHandlers   = new Set<(e: Event.Common.ICommonEvent<IDragEndData>) => void>();

                onDragStart(handler: (evt: Event.Common.ICommonEvent<IDragStartData>) => void): void {
                    this.startHandlers.add(handler);
                }

                onDragMove(handler: (evt: Event.Common.ICommonEvent<IDragMoveData>) => void): void {
                    this.moveHandlers.add(handler);
                }

                onDragEnd(handler: (evt: Event.Common.ICommonEvent<IDragEndData>) => void): void {
                    this.endHandlers.add(handler);
                }

                protected emitStart(evt: Event.Common.ICommonEvent<IDragStartData>): void {
                    for (const h of this.startHandlers) h(evt);
                }

                protected emitMove(evt: Event.Common.ICommonEvent<IDragMoveData>): void {
                    for (const h of this.moveHandlers) h(evt);
                }

                protected emitEnd(evt: Event.Common.ICommonEvent<IDragEndData>): void {
                    for (const h of this.endHandlers) h(evt);
                }

                abstract dispose(): void;
            }
        }
    }
}

export interface Position {
    readonly x: number;
    readonly y: number;
}

export class TimeStamp {
    private constructor(private readonly value: number) {}

    static now(): TimeStamp {
        return new TimeStamp(performance.now());
    }

    toNumber() { return this.value; }

    toString() {
        return `TimeStamp(${this.value})`;
    }
}

export type EventName = string & { readonly __brand: unique symbol };

export function defineEventName<T extends string>(name: T): EventName {
    return name as EventName;
}

export interface ICommonEventData {
    readonly event: EventName;
}

export interface ICommonEvent<TData extends ICommonEventData> {
    readonly name: EventName;
    readonly timestamp: TimeStamp;
    readonly data: TData;
    dispose(): void;
}

export class CommonEvent<TData extends ICommonEventData>
    implements ICommonEvent<TData>
{
    private disposed = false;

    constructor(
        public readonly name: EventName,
        public readonly timestamp: TimeStamp,
        public readonly data: TData
    ) {}

    dispose(): void {
        if (this.disposed) return;
        (this as any).data = null;
        this.disposed = true;
    }
}

export interface ICommonEventHandler<TData extends ICommonEventData> {
    handle(evt: ICommonEvent<TData>): void | Promise<void>;
}


export interface IMouseController {
    onMove(handler: (pos: Position) => void): void;
    onDown(handler: (pos: Position) => void): void;
    onUp(handler: (pos: Position) => void): void;
    onWheel(handler: (delta: number, pos: Position) => void): void;

    dispose(): void;
}

export abstract class BaseMouseController implements IMouseController {

    private readonly moveHandlers  = new Set<(pos: Position) => void>();
    private readonly downHandlers  = new Set<(pos: Position) => void>();
    private readonly upHandlers    = new Set<(pos: Position) => void>();
    private readonly wheelHandlers = new Set<(delta: number, pos: Position) => void>();

    onMove(handler: (pos: Position) => void): void {
        this.moveHandlers.add(handler);
    }

    onDown(handler: (pos: Position) => void): void {
        this.downHandlers.add(handler);
    }

    onUp(handler: (pos: Position) => void): void {
        this.upHandlers.add(handler);
    }

    onWheel(handler: (delta: number, pos: Position) => void): void {
        this.wheelHandlers.add(handler);
    }

    protected emitMove(pos: Position): void {
        for (const h of this.moveHandlers) h(pos);
    }

    protected emitDown(pos: Position): void {
        for (const h of this.downHandlers) h(pos);
    }

    protected emitUp(pos: Position): void {
        for (const h of this.upHandlers) h(pos);
    }

    protected emitWheel(delta: number, pos: Position): void {
        for (const h of this.wheelHandlers) h(delta, pos);
    }

    abstract dispose(): void;
}


export interface IDragStartData extends ICommonEventData {
    readonly start: Position;
}

export interface IDragMoveData extends ICommonEventData {
    readonly start: Position;
    readonly current: Position;
    readonly delta: Position;
}

export interface IDragEndData extends ICommonEventData {
    readonly start: Position;
    readonly end: Position;
}

export interface IDragController {
    onDragStart(handler: (evt: ICommonEvent<IDragStartData>) => void): void;
    onDragMove(handler: (evt: ICommonEvent<IDragMoveData>) => void): void;
    onDragEnd(handler: (evt: ICommonEvent<IDragEndData>) => void): void;
    dispose(): void;
}

export abstract class BaseDragController implements IDragController {

    private readonly startHandlers = new Set<(e: ICommonEvent<IDragStartData>) => void>();
    private readonly moveHandlers  = new Set<(e: ICommonEvent<IDragMoveData>) => void>();
    private readonly endHandlers   = new Set<(e: ICommonEvent<IDragEndData>) => void>();

    onDragStart(handler: (evt: ICommonEvent<IDragStartData>) => void): void {
        this.startHandlers.add(handler);
    }

    onDragMove(handler: (evt: ICommonEvent<IDragMoveData>) => void): void {
        this.moveHandlers.add(handler);
    }

    onDragEnd(handler: (evt: ICommonEvent<IDragEndData>) => void): void {
        this.endHandlers.add(handler);
    }

    protected emitStart(evt: ICommonEvent<IDragStartData>): void {
        for (const h of this.startHandlers) h(evt);
    }

    protected emitMove(evt: ICommonEvent<IDragMoveData>): void {
        for (const h of this.moveHandlers) h(evt);
    }

    protected emitEnd(evt: ICommonEvent<IDragEndData>): void {
        for (const h of this.endHandlers) h(evt);
    }

    abstract dispose(): void;
}

import {
    Position,
    BaseMouseController
} from "../core-mouse-controller-abstract/index.js";

export class DOMMouseController extends BaseMouseController {

    private readonly target: HTMLElement;

    private readonly onMouseMoveBound: (e: MouseEvent) => void;
    private readonly onMouseDownBound: (e: MouseEvent) => void;
    private readonly onMouseUpBound: (e: MouseEvent) => void;
    private readonly onWheelBound: (e: WheelEvent) => void;

    constructor(target: HTMLElement) {
        super();
        this.target = target;

        this.onMouseMoveBound = (e) => this.handleMove(e);
        this.onMouseDownBound = (e) => this.handleDown(e);
        this.onMouseUpBound   = (e) => this.handleUp(e);
        this.onWheelBound     = (e) => this.handleWheel(e);

        this.target.addEventListener("mousemove", this.onMouseMoveBound);
        this.target.addEventListener("mousedown", this.onMouseDownBound);
        this.target.addEventListener("mouseup",   this.onMouseUpBound);
        this.target.addEventListener("wheel",     this.onWheelBound, { passive: true });
    }

    private toPosition(e: MouseEvent | WheelEvent): Position {
        const rect = this.target.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    private handleMove(e: MouseEvent) {
        this.emitMove(this.toPosition(e));
    }

    private handleDown(e: MouseEvent) {
        this.emitDown(this.toPosition(e));
    }

    private handleUp(e: MouseEvent) {
        this.emitUp(this.toPosition(e));
    }

    private handleWheel(e: WheelEvent) {
        this.emitWheel(e.deltaY, this.toPosition(e));
    }

    dispose(): void {
        this.target.removeEventListener("mousemove", this.onMouseMoveBound);
        this.target.removeEventListener("mousedown", this.onMouseDownBound);
        this.target.removeEventListener("mouseup",   this.onMouseUpBound);
        this.target.removeEventListener("wheel",     this.onWheelBound);
    }
}

import {
    Position,
    BaseMouseController
} from "../core-mouse-controller-abstract/index.js";




function getSvgPosition(svg: SVGSVGElement, e: MouseEvent | WheelEvent): Position {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };

    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
}

export class SVGMouseController extends BaseMouseController {

    private readonly svg: SVGSVGElement;

    private readonly onMoveBound: (e: MouseEvent) => void;
    private readonly onDownBound: (e: MouseEvent) => void;
    private readonly onUpBound: (e: MouseEvent) => void;
    private readonly onWheelBound: (e: WheelEvent) => void;

    constructor(svgRoot: SVGSVGElement) {
        super();
        this.svg = svgRoot;

        this.onMoveBound = (e) => this.emitMove(getSvgPosition(this.svg, e));
        this.onDownBound = (e) => this.emitDown(getSvgPosition(this.svg, e));
        this.onUpBound   = (e) => this.emitUp(getSvgPosition(this.svg, e));
        this.onWheelBound = (e) =>
            this.emitWheel(e.deltaY, getSvgPosition(this.svg, e));

        svgRoot.addEventListener("mousemove", this.onMoveBound);
        svgRoot.addEventListener("mousedown", this.onDownBound);
        svgRoot.addEventListener("mouseup",   this.onUpBound);
        svgRoot.addEventListener("wheel",     this.onWheelBound, { passive: true });
    }

    dispose(): void {
        this.svg.removeEventListener("mousemove", this.onMoveBound);
        this.svg.removeEventListener("mousedown", this.onDownBound);
        this.svg.removeEventListener("mouseup",   this.onUpBound);
        this.svg.removeEventListener("wheel",     this.onWheelBound);
    }
}

import {
    Position,
    BaseMouseController
} from "../core-mouse-controller-abstract/index.js";

export interface ThreeJsMouseConfig {



    preventDefault?: boolean;





    useNormalizedCoordinates?: boolean;
}

export class ThreeJsMouseController extends BaseMouseController {

    private readonly canvas: HTMLCanvasElement;
    private readonly config: Required<ThreeJsMouseConfig>;

    private readonly onMoveBound: (e: MouseEvent) => void;
    private readonly onDownBound: (e: MouseEvent) => void;
    private readonly onUpBound: (e: MouseEvent) => void;
    private readonly onWheelBound: (e: WheelEvent) => void;

    private disposed = false;

    constructor(
        canvas: HTMLCanvasElement,
        config: ThreeJsMouseConfig = {}
    ) {
        super();

        this.canvas = canvas;

        this.config = {
            preventDefault: config.preventDefault ?? false,
            useNormalizedCoordinates: config.useNormalizedCoordinates ?? true
        };

        this.onMoveBound = (e) => this.handleMove(e);
        this.onDownBound = (e) => this.handleDown(e);
        this.onUpBound   = (e) => this.handleUp(e);
        this.onWheelBound = (e) => this.handleWheel(e);

        canvas.addEventListener("mousemove", this.onMoveBound);
        canvas.addEventListener("mousedown", this.onDownBound);
        canvas.addEventListener("mouseup",   this.onUpBound);
        canvas.addEventListener("wheel",     this.onWheelBound, { passive: true });
    }


    private applyPreventDefault(e: Event) {
        if (this.config.preventDefault) {
            e.preventDefault();
        }
    }

    private toPixelPosition(e: MouseEvent | WheelEvent): Position {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    private toNDC(e: MouseEvent | WheelEvent): Position {
        const rect = this.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        return { x, y };
    }

    private resolvePosition(e: MouseEvent | WheelEvent): Position {
        return this.config.useNormalizedCoordinates
            ? this.toNDC(e)
            : this.toPixelPosition(e);
    }


    private handleMove(e: MouseEvent) {
        if (this.disposed) return;
        this.applyPreventDefault(e);
        this.emitMove(this.resolvePosition(e));
    }

    private handleDown(e: MouseEvent) {
        if (this.disposed) return;
        this.applyPreventDefault(e);
        this.emitDown(this.resolvePosition(e));
    }

    private handleUp(e: MouseEvent) {
        if (this.disposed) return;
        this.applyPreventDefault(e);
        this.emitUp(this.resolvePosition(e));
    }

    private handleWheel(e: WheelEvent) {
        if (this.disposed) return;
        this.applyPreventDefault(e);
        this.emitWheel(e.deltaY, this.resolvePosition(e));
    }


    dispose(): void {
        if (this.disposed) return;
        this.disposed = true;

        this.canvas.removeEventListener("mousemove", this.onMoveBound);
        this.canvas.removeEventListener("mousedown", this.onDownBound);
        this.canvas.removeEventListener("mouseup",   this.onUpBound);
        this.canvas.removeEventListener("wheel",     this.onWheelBound);
    }
}

import {
    Position,
    ICommonEvent,
    CommonEvent,
    TimeStamp,
    defineEventName,
    IDragStartData,
    IDragMoveData,
    IDragEndData,
    BaseDragController
} from "../core-drag-controller-abstract/index.js";

import {
    IMouseController
} from "../core-mouse-controller-abstract/index.js";

export const DRAG_START = defineEventName("drag:start");
export const DRAG_MOVE  = defineEventName("drag:move");
export const DRAG_END   = defineEventName("drag:end");

export class DOMDragController extends BaseDragController {

    private readonly mouse: IMouseController;

    private dragging = false;
    private startPos: Position | null = null;
    private lastPos: Position | null = null;

    constructor(mouseController: IMouseController) {
        super();
        this.mouse = mouseController;

        this.mouse.onDown((pos) => this.beginDrag(pos));
        this.mouse.onMove((pos) => this.updateDrag(pos));
        this.mouse.onUp((pos)   => this.endDrag(pos));
        this.mouse.onWheel(() => {

        });
    }


    private beginDrag(pos: Position): void {
        this.dragging = true;
        this.startPos = pos;
        this.lastPos = pos;

        const data: IDragStartData = {
            event: DRAG_START,
            start: pos
        };

        const evt: ICommonEvent<IDragStartData> = new CommonEvent(
            DRAG_START,
            TimeStamp.now(),
            data
        );

        this.emitStart(evt);
    }

    private updateDrag(pos: Position): void {
        if (!this.dragging || !this.startPos || !this.lastPos) return;

        const delta: Position = {
            x: pos.x - this.lastPos.x,
            y: pos.y - this.lastPos.y
        };

        const data: IDragMoveData = {
            event: DRAG_MOVE,
            start: this.startPos,
            current: pos,
            delta
        };

        const evt: ICommonEvent<IDragMoveData> = new CommonEvent(
            DRAG_MOVE,
            TimeStamp.now(),
            data
        );

        this.lastPos = pos;
        this.emitMove(evt);
    }

    private endDrag(pos: Position): void {
        if (!this.dragging || !this.startPos) return;

        this.dragging = false;

        const data: IDragEndData = {
            event: DRAG_END,
            start: this.startPos,
            end: pos
        };

        const evt: ICommonEvent<IDragEndData> = new CommonEvent(
            DRAG_END,
            TimeStamp.now(),
            data
        );

        this.emitEnd(evt);

        this.startPos = null;
        this.lastPos = null;
    }

    dispose(): void {
        this.dragging = false;
        this.startPos = null;
        this.lastPos = null;
    }
}

import {
    Position,
    ICommonEvent,
    CommonEvent,
    TimeStamp,
    defineEventName,
    IDragStartData,
    IDragMoveData,
    IDragEndData,
    BaseDragController
} from "../core-drag-controller-abstract/index.js";

import {
    IMouseController
} from "../core-mouse-controller-abstract/index.js";

export const DRAG_START = defineEventName("drag:start");
export const DRAG_MOVE  = defineEventName("drag:move");
export const DRAG_END   = defineEventName("drag:end");

function toSvgPosition(svg: SVGSVGElement, pos: Position): Position {
    const pt = svg.createSVGPoint();
    pt.x = pos.x;
    pt.y = pos.y;

    const ctm = svg.getScreenCTM();
    if (!ctm) return pos;

    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
}

export class SVGDragController extends BaseDragController {

    private readonly svg: SVGSVGElement;
    private readonly mouse: IMouseController;

    private dragging = false;
    private startPos: Position | null = null;
    private lastPos: Position | null = null;

    constructor(
        svgRoot: SVGSVGElement,
        mouseController: IMouseController
    ) {
        super();
        this.svg = svgRoot;
        this.mouse = mouseController;

        this.mouse.onDown((pos) => this.beginDrag(pos));
        this.mouse.onMove((pos) => this.updateDrag(pos));
        this.mouse.onUp((pos)   => this.endDrag(pos));
    }


    private beginDrag(pos: Position): void {
        const local = toSvgPosition(this.svg, pos);

        this.dragging = true;
        this.startPos = local;
        this.lastPos = local;

        const data: IDragStartData = {
            event: DRAG_START,
            start: local
        };

        const evt: ICommonEvent<IDragStartData> = new CommonEvent(
            DRAG_START,
            TimeStamp.now(),
            data
        );

        this.emitStart(evt);
    }

    private updateDrag(pos: Position): void {
        if (!this.dragging || !this.startPos || !this.lastPos) return;

        const local = toSvgPosition(this.svg, pos);

        const delta: Position = {
            x: local.x - this.lastPos.x,
            y: local.y - this.lastPos.y
        };

        const data: IDragMoveData = {
            event: DRAG_MOVE,
            start: this.startPos,
            current: local,
            delta
        };

        const evt: ICommonEvent<IDragMoveData> = new CommonEvent(
            DRAG_MOVE,
            TimeStamp.now(),
            data
        );

        this.lastPos = local;
        this.emitMove(evt);
    }

    private endDrag(pos: Position): void {
        if (!this.dragging || !this.startPos) return;

        const local = toSvgPosition(this.svg, pos);

        const data: IDragEndData = {
            event: DRAG_END,
            start: this.startPos,
            end: local
        };

        const evt: ICommonEvent<IDragEndData> = new CommonEvent(
            DRAG_END,
            TimeStamp.now(),
            data
        );

        this.emitEnd(evt);

        this.dragging = false;
        this.startPos = null;
        this.lastPos = null;
    }

    dispose(): void {
        this.dragging = false;
        this.startPos = null;
        this.lastPos = null;
    }
}

import {
    Position,
    ICommonEvent,
    CommonEvent,
    TimeStamp,
    defineEventName,
    IDragStartData,
    IDragMoveData,
    IDragEndData,
    BaseDragController
} from "../core-drag-controller-abstract/index.js";

import {
    IMouseController
} from "../core-mouse-controller-abstract/index.js";

import * as THREE from "three";

export const DRAG_START = defineEventName("drag:start");
export const DRAG_MOVE  = defineEventName("drag:move");
export const DRAG_END   = defineEventName("drag:end");


export interface ThreeDragStartData extends IDragStartData {
    readonly worldStart: THREE.Vector3;
    readonly object: THREE.Object3D;
}

export interface ThreeDragMoveData extends IDragMoveData {
    readonly worldCurrent: THREE.Vector3;
    readonly worldDelta: THREE.Vector3;
    readonly object: THREE.Object3D;
}

export interface ThreeDragEndData extends IDragEndData {
    readonly worldEnd: THREE.Vector3;
    readonly object: THREE.Object3D;
}

export class ThreeJsDragController extends BaseDragController {

    private readonly mouse: IMouseController;
    private readonly camera: THREE.Camera;
    private readonly scene: THREE.Scene;

    private readonly raycaster = new THREE.Raycaster();

    private dragging = false;
    private draggedObject: THREE.Object3D | null = null;

    private start2D: Position | null = null;
    private last2D: Position | null = null;

    private start3D: THREE.Vector3 | null = null;
    private last3D: THREE.Vector3 | null = null;

    constructor(
        mouse: IMouseController,
        scene: THREE.Scene,
        camera: THREE.Camera
    ) {
        super();

        this.mouse = mouse;
        this.scene = scene;
        this.camera = camera;

        mouse.onDown((pos) => this.tryBeginDrag(pos));
        mouse.onMove((pos) => this.tryMoveDrag(pos));
        mouse.onUp((pos)   => this.tryEndDrag(pos));
    }


    private raycast(pos: Position): THREE.Intersection[] {
        this.raycaster.setFromCamera({ x: pos.x, y: pos.y }, this.camera);
        return this.raycaster.intersectObjects(this.scene.children, true);
    }

    private tryBeginDrag(pos: Position) {
        const hits = this.raycast(pos);
        if (hits.length === 0) return;

        const hit = hits[0];

        this.dragging = true;
        this.draggedObject = hit.object;

        this.start2D = pos;
        this.last2D = pos;

        this.start3D = hit.point.clone();
        this.last3D = hit.point.clone();

        const data: ThreeDragStartData = {
            event: DRAG_START,
            start: pos,
            worldStart: hit.point.clone(),
            object: hit.object
        };

        const evt: ICommonEvent<ThreeDragStartData> =
            new CommonEvent(DRAG_START, TimeStamp.now(), data);

        this.emitStart(evt);
    }

    private tryMoveDrag(pos: Position) {
        if (!this.dragging || !this.draggedObject || !this.start3D || !this.last3D)
            return;

        const hits = this.raycast(pos);
        if (hits.length === 0) return;

        const hit = hits[0];
        const world = hit.point.clone();

        const worldDelta = new THREE.Vector3().subVectors(world, this.last3D);

        const data: ThreeDragMoveData = {
            event: DRAG_MOVE,
            start: this.start2D!,
            current: pos,
            delta: {
                x: pos.x - this.last2D!.x,
                y: pos.y - this.last2D!.y
            },
            worldCurrent: world,
            worldDelta,
            object: this.draggedObject
        };

        const evt: ICommonEvent<ThreeDragMoveData> =
            new CommonEvent(DRAG_MOVE, TimeStamp.now(), data);

        this.last2D = pos;
        this.last3D = world;

        this.emitMove(evt);
    }

    private tryEndDrag(pos: Position) {
        if (!this.dragging || !this.draggedObject || !this.start3D) return;

        const hits = this.raycast(pos);
        const worldEnd = hits.length > 0
            ? hits[0].point.clone()
            : this.last3D!.clone();

        const data: ThreeDragEndData = {
            event: DRAG_END,
            start: this.start2D!,
            end: pos,
            worldEnd,
            object: this.draggedObject
        };

        const evt: ICommonEvent<ThreeDragEndData> =
            new CommonEvent(DRAG_END, TimeStamp.now(), data);

        this.emitEnd(evt);

        this.dragging = false;
        this.draggedObject = null;
        this.start2D = null;
        this.last2D = null;
        this.start3D = null;
        this.last3D = null;
    }

    dispose(): void {
        this.dragging = false;
        this.draggedObject = null;
        this.start2D = null;
        this.last2D = null;
        this.start3D = null;
        this.last3D = null;
    }
}

import {
    EventName,
    ICommonEvent,
    ICommonEventHandler,
    ICommonEventData,
    CommonEvent,
    TimeStamp
} from "../core-event-common/index.js";




interface HandlerRegistration<TData extends ICommonEventData> {
    readonly event: EventName;
    readonly handler: ICommonEventHandler<TData>;
}










export class EventBus {

    private readonly handlers = new Map<EventName, Set<ICommonEventHandler<any>>>();
    private disposed = false;

    register<TData extends ICommonEventData>(
        event: EventName,
        handler: ICommonEventHandler<TData>
    ): void {
        if (this.disposed) return;

        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        this.handlers.get(event)!.add(handler);
    }

    unregister<TData extends ICommonEventData>(
        event: EventName,
        handler: ICommonEventHandler<TData>
    ): void {
        const hs = this.handlers.get(event);
        if (!hs) return;

        hs.delete(handler);

        if (hs.size === 0) {
            this.handlers.delete(event);
        }
    }

    async dispatch<TData extends ICommonEventData>(
        event: ICommonEvent<TData>
    ): Promise<void> {
        if (this.disposed) return;

        const hs = this.handlers.get(event.name);
        if (!hs) return;

        for (const handler of hs) {
            try {
                const result = handler.handle(event);
                if (result instanceof Promise) {
                    await result;
                }
            } catch (err) {
                console.error("EventBus handler error:", err);
            }
        }
    }

    async emit<TData extends ICommonEventData>(
        name: EventName,
        data: TData
    ): Promise<void> {
        const evt = new CommonEvent(name, TimeStamp.now(), data);
        await this.dispatch(evt);
        evt.dispose();
    }

    dispose(): void {
        if (this.disposed) return;
        this.disposed = true;

        this.handlers.clear();
    }
}

import {
    ICommonEvent,
    ICommonEventData
} from "../core-event-common/index.js";







export interface IBusinessLogic<TData extends ICommonEventData> {
    execute(data: TData): void | Promise<void>;
}








export interface IEventHandler<TData extends ICommonEventData> {
    handle(evt: ICommonEvent<TData>): void | Promise<void>;
    dispose(): void;
}








export abstract class BaseEventHandler<TData extends ICommonEventData>
    implements IEventHandler<TData> {

    private disposed = false;

    constructor(
        protected readonly logic: IBusinessLogic<TData>
    ) {}

    async handle(evt: ICommonEvent<TData>): Promise<void> {
        if (this.disposed) return;

        await this.before(evt);
        await this.logic.execute(evt.data);
        await this.after(evt);

        evt.dispose();
    }




    protected async before(evt: ICommonEvent<TData>): Promise<void> {

    }




    protected async after(evt: ICommonEvent<TData>): Promise<void> {

    }

    dispose(): void {
        this.disposed = true;
        this.onDispose();
    }

    protected onDispose(): void {

    }
}

import {
    defineEventName,
    EventName,
    ICommonEventData,
    CommonEvent,
    TimeStamp
} from "../core-event-common/index.js";

export const DRAG_MOVE_EVENT: EventName = defineEventName("app:drag:move");

export interface AppDragMoveData extends ICommonEventData {
    readonly x: number;
    readonly y: number;
    readonly objectId: string;
}


import { IBusinessLogic } from "../core-business-logic/index.js";

export class UpdatePositionBusinessLogic
    implements IBusinessLogic<AppDragMoveData>
{
    execute(data: AppDragMoveData): void {
        console.log(
            `[BusinessLogic] Object ${data.objectId} dragged to (${data.x}, ${data.y})`
        );
    }
}


import {
    BaseEventHandler
} from "../core-business-logic/index.js";

export class DragMoveEventHandler
    extends BaseEventHandler<AppDragMoveData>
{
    protected async before(evt) {
        console.log("[Handler:Before] drag move");
    }

    protected async after(evt) {
        console.log("[Handler:After] drag move");
    }
}


import { EventBus } from "../core-event-dispatcher/index.js";

export function createAppEventBus(): EventBus {
    const bus = new EventBus();

    const logic = new UpdatePositionBusinessLogic();
    const handler = new DragMoveEventHandler(logic);

    bus.register(DRAG_MOVE_EVENT, handler);

    return bus;
}


import {
    DOMMouseController
} from "../core-mouse-controller-dom/index.js";


import {
    DOMDragController,
    DRAG_MOVE
} from "../core-drag-controller-dom/index.js";


export class Application {

    private readonly mouse: DOMMouseController;
    private readonly drag: DOMDragController;
    private readonly bus: EventBus;

    constructor(canvas: HTMLElement) {

        this.bus = createAppEventBus();

        this.mouse = new DOMMouseController(canvas);

        this.drag = new DOMDragController(this.mouse);

        this.drag.onDragMove(async (evt) => {

            const appData: AppDragMoveData = {
                event: DRAG_MOVE_EVENT,
                x: evt.data.current.x,
                y: evt.data.current.y,
                objectId: "object-123"
            };

            const appEvent = new CommonEvent(
                DRAG_MOVE_EVENT,
                TimeStamp.now(),
                appData
            );

            await this.bus.dispatch(appEvent);
            appEvent.dispose();
        });
    }

    dispose() {
        this.mouse.dispose();
        this.drag.dispose();
        this.bus.dispose();
    }
}


const canvas = document.getElementById("myCanvas") as HTMLElement;
const app = new Application(canvas);

