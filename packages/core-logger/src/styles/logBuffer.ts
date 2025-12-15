export class LogBuffer {
  private static idCounter = 0;
  private static store = new Map<number, any>();

  static allocate(initial: any): number {
    const id = ++this.idCounter;
    this.store.set(id, initial);
    return id;
  }

  static update(id: number, value: any): void {
    this.store.set(id, value);
  }

  static get(id: number): any {
    return this.store.get(id);
  }
}
