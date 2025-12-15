export class ControllerCollection<T> {
  private readonly items = new Set<T>();

  add(item: T) { this.items.add(item); }
  delete(item: T) { this.items.delete(item); }
  forEach(fn: (item: T) => void) { this.items.forEach(fn); }
}
