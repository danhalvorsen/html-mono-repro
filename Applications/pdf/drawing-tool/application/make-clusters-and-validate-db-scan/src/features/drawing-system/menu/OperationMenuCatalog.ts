export const DrawingOperations = {
    save: "save",
    load: "load",
    delete: "delete"
} as const;

export type DrawingOperation = typeof DrawingOperations[keyof typeof DrawingOperations];

export interface IOperationMenuItem {
    readonly operation: DrawingOperation;
    readonly title: string;
    readonly fill: string;
}

export const OperationMenuCatalog: ReadonlyArray<IOperationMenuItem> = [
    {
        operation: DrawingOperations.save,
        title: "Save",
        fill: "#22c55e"
    },
    {
        operation: DrawingOperations.load,
        title: "Load",
        fill: "#38bdf8"
    },
    {
        operation: DrawingOperations.delete,
        title: "Delete",
        fill: "#f43f5e"
    }
];
