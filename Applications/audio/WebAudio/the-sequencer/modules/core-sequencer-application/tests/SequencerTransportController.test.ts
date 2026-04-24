import { describe, expect, it } from "vitest";
import {
  type IMidiStreamPlaybackPort,
  type ISequencerMidiStreamProvider,
  SequencerTransportController,
  SequencerTransportState,
} from "../src/index.js";

class RecordingMidiPlaybackPort implements IMidiStreamPlaybackPort {
  public readonly startedStreams: string[] = [];
  public stopCalls = 0;

  public async start(midiStream: string): Promise<void> {
    this.startedStreams.push(midiStream);
  }

  public async stop(): Promise<void> {
    this.stopCalls += 1;
  }
}

class StaticStreamProvider implements ISequencerMidiStreamProvider {
  private readonly stream: string;

  public constructor(stream: string) {
    this.stream = stream;
  }

  public buildStream(): string {
    return this.stream;
  }
}

describe("SequencerTransportController", () => {
  it("should start in stopped projection state", () => {
    const controller = new SequencerTransportController();

    expect(controller.projection.state).toBe(SequencerTransportState.Stopped);
    expect(controller.projection.isPlaying).toBe(false);
  });

  it("should transition to playing when play is requested", async () => {
    const controller = new SequencerTransportController();

    await controller.requestPlay();

    expect(controller.projection.state).toBe(SequencerTransportState.Playing);
    expect(controller.projection.isPlaying).toBe(true);
  });

  it("should transition to stopped when stop is requested after play", async () => {
    const controller = new SequencerTransportController();
    await controller.requestPlay();

    await controller.requestStop();

    expect(controller.projection.state).toBe(SequencerTransportState.Stopped);
    expect(controller.projection.isPlaying).toBe(false);
  });

  it("should notify subscribers only when projection changes", async () => {
    const controller = new SequencerTransportController();
    const observedStates: string[] = [];

    const unsubscribe = controller.subscribe((projection) => {
      observedStates.push(projection.state);
    });

    await controller.requestStop();
    await controller.requestPlay();
    await controller.requestPlay();
    await controller.requestStop();
    unsubscribe();

    expect(observedStates).toEqual(["stopped", "playing", "stopped"]);
  });

  it("should start midi playback once when transitioning from stopped to playing", async () => {
    const playback = new RecordingMidiPlaybackPort();
    const streamProvider = new StaticStreamProvider("N36-h125-v122-ch1");
    const controller = new SequencerTransportController({
      midiPlayback: playback,
      midiStreamProvider: streamProvider,
    });

    await controller.requestPlay();
    await controller.requestPlay();

    expect(playback.startedStreams).toEqual(["N36-h125-v122-ch1"]);
  });

  it("should stop midi playback once when transitioning from playing to stopped", async () => {
    const playback = new RecordingMidiPlaybackPort();
    const controller = new SequencerTransportController({
      midiPlayback: playback,
      midiStreamProvider: new StaticStreamProvider("N36-h125-v122-ch1"),
    });

    await controller.requestPlay();
    await controller.requestStop();
    await controller.requestStop();

    expect(playback.stopCalls).toBe(1);
  });
});
