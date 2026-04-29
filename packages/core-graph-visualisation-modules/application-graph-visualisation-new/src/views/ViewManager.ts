import { LitElement } from "lit";

export interface ViewEntry {
    id: string;
    label: string;
    component: typeof LitElement;
}

export class ViewManager {
    private views: Map<string, ViewEntry> = new Map();
    private activeViewId: string | null = null;
    private listeners: Set<() => void> = new Set();

    registerView(view: ViewEntry): void {
        this.views.set(view.id, view);
    }

    getView(id: string): ViewEntry | undefined {
        return this.views.get(id);
    }

    getAllViews(): ViewEntry[] {
        return Array.from(this.views.values());
    }

    setActiveView(id: string): boolean {
        if (!this.views.has(id)) {
            return false;
        }
        this.activeViewId = id;
        this.notifyListeners();
        return true;
    }

    getActiveViewId(): string | null {
        return this.activeViewId;
    }

    getActiveView(): ViewEntry | null {
        if (!this.activeViewId) {
            return null;
        }
        return this.views.get(this.activeViewId) || null;
    }

    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener());
    }
}
