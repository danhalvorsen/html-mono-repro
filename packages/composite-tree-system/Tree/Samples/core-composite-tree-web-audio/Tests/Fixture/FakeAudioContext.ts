// Tests/Fixture/FakeAudioContext.ts

type FakeAudioContextState = "running" | "suspended" | "closed";

export class FakeAudioParam {
  public value = 0;

  public setValueAtTime(value: number, _time: number): void {
    this.value = value;
  }
}

export class FakeAudioNode {
  public readonly connections: FakeAudioNode[] = [];
  public disconnectCount = 0;

  public connect(target: FakeAudioNode): FakeAudioNode {
    this.connections.push(target);
    return target;
  }

  public disconnect(_target?: FakeAudioNode): void {
    this.disconnectCount++;
    this.connections.length = 0;
  }
}

export class FakeDestinationNode extends FakeAudioNode {}

export class FakeGainNode extends FakeAudioNode {
  public readonly gain = new FakeAudioParam();
}

export class FakeOscillatorNode extends FakeAudioNode {
  public readonly frequency = new FakeAudioParam();
  public readonly detune = new FakeAudioParam();
  public type: OscillatorType = "sine";

  public startCount = 0;
  public stopCount = 0;

  public start(): void {
    this.startCount++;
  }

  public stop(): void {
    this.stopCount++;
  }
}

export class FakeAudioContext {
  public readonly createdGainNodes: FakeGainNode[] = [];
  public readonly createdOscillatorNodes: FakeOscillatorNode[] = [];
  public readonly destination = new FakeDestinationNode();

  public currentTime = 0;
  public state: FakeAudioContextState = "suspended";
  public resumeCount = 0;
  public closeCount = 0;

  public createGain(): GainNode {
    const node = new FakeGainNode();
    this.createdGainNodes.push(node);
    return node as unknown as GainNode;
  }

  public createOscillator(): OscillatorNode {
    const node = new FakeOscillatorNode();
    this.createdOscillatorNodes.push(node);
    return node as unknown as OscillatorNode;
  }

  public async resume(): Promise<void> {
    this.resumeCount++;
    this.state = "running";
  }

  public async close(): Promise<void> {
    this.closeCount++;
    this.state = "closed";
  }
}