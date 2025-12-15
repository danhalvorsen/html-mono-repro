/* ============================================================
   IReactiveController.ts
   ============================================================ */

export interface IReactiveController<T> {
    attach(target: T): void;
    update(dt: number): void;
    detach(): void;
}
