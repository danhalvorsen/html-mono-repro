interface QueueNode<TValue> {
  readonly value: TValue;
  readonly priority: number;
  readonly tieBreaker: number;
  readonly sequence: number;
}

export class StablePriorityQueue<TValue> {
  private readonly heap: QueueNode<TValue>[] = [];
  private sequenceCounter = 0;

  public get size(): number {
    return this.heap.length;
  }

  public enqueue(value: TValue, priority: number, tieBreaker: number): void {
    const node: QueueNode<TValue> = {
      value,
      priority,
      tieBreaker,
      sequence: this.sequenceCounter,
    };

    this.sequenceCounter += 1;
    this.heap.push(node);
    this.siftUp(this.heap.length - 1);
  }

  public dequeue(): TValue | null {
    if (this.heap.length === 0) {
      return null;
    }

    const root = this.heap[0];
    const last = this.heap.pop();

    if (root === undefined) {
      return null;
    }

    if (this.heap.length > 0 && last !== undefined) {
      this.heap[0] = last;
      this.siftDown(0);
    }

    return root.value;
  }

  private siftUp(index: number): void {
    let current = index;

    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);

      if (!this.lessThan(current, parent)) {
        break;
      }

      this.swap(current, parent);
      current = parent;
    }
  }

  private siftDown(index: number): void {
    let current = index;

    while (true) {
      const left = current * 2 + 1;
      const right = current * 2 + 2;
      let candidate = current;

      if (left < this.heap.length && this.lessThan(left, candidate)) {
        candidate = left;
      }

      if (right < this.heap.length && this.lessThan(right, candidate)) {
        candidate = right;
      }

      if (candidate === current) {
        break;
      }

      this.swap(current, candidate);
      current = candidate;
    }
  }

  private lessThan(leftIndex: number, rightIndex: number): boolean {
    const left = this.heap[leftIndex];
    const right = this.heap[rightIndex];

    if (left === undefined || right === undefined) {
      return false;
    }

    if (left.priority !== right.priority) {
      return left.priority < right.priority;
    }

    if (left.tieBreaker !== right.tieBreaker) {
      return left.tieBreaker < right.tieBreaker;
    }

    return left.sequence < right.sequence;
  }

  private swap(leftIndex: number, rightIndex: number): void {
    const left = this.heap[leftIndex];
    const right = this.heap[rightIndex];

    if (left === undefined || right === undefined) {
      return;
    }

    this.heap[leftIndex] = right;
    this.heap[rightIndex] = left;
  }
}
