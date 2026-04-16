import { LitElement } from "lit";

export interface IViewController {
    id: string;
    label: string;
    component: typeof LitElement;
}

export abstract class ViewController extends LitElement implements IViewController {
    abstract id: string;
    abstract label: string;
    abstract component: typeof LitElement;
}
