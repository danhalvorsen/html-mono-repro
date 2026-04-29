import { describe, it } from "vitest";
import { should } from "chai";
import {
  MidiMessageKinds,
  type IMidiStreamScheduler,
  type IMidiStreamSink,
  type MidiSong,
  type MidiStreamCompleted,
  type MidiStreamFailure,
  type MidiStreamMessage,
  type MidiStreamSubscription,
} from "@monorepo/audio-function-midi-streamer-contracts";
import { MidiSongStreamer } from "../src/application/MidiSongStreamer.js";
import { MidiSongValidator } from "../src/domain/MidiSongValidator.js";

should();

describe("MidiSongStreamer", () => {
  it("should schedule MIDI messages in tick order", () => {
    const fixture = new MidiSongStreamerFixture();

    fixture.stream(fixture.createSongWithUnorderedEvents());
    fixture.scheduler.runAll();

    fixture.sink.messages.map((event) => event.message).should.deep.equal([
      {
        kind: MidiMessageKinds.noteOn,
        channel: 0,
        note: 60,
        velocity: 100,
      },
      {
        kind: MidiMessageKinds.noteOff,
        channel: 0,
        note: 60,
        velocity: 0,
      },
    ]);

    fixture.sink.completed.should.deep.equal({
      songId: "test-song",
      eventCount: 2,
    });
  });

  it("should cancel scheduled MIDI messages when subscription is cancelled", () => {
    const fixture = new MidiSongStreamerFixture();

    const subscription = fixture.stream(fixture.createSongWithUnorderedEvents());
    subscription.cancel();
    fixture.scheduler.runAll();

    fixture.sink.messages.should.deep.equal([]);
  });
});

class MidiSongStreamerFixture {
  public readonly scheduler = new ManualMidiStreamScheduler();
  public readonly sink = new RecordingMidiStreamSink();

  private readonly streamer = new MidiSongStreamer(
    this.scheduler,
    new MidiSongValidator(),
  );

  public stream(song: MidiSong): MidiStreamSubscription {
    return this.streamer.stream(song, this.sink);
  }

  public createSongWithUnorderedEvents(): MidiSong {
    return {
      id: "test-song",
      title: "Test Song",
      tempoBpm: 120,
      ticksPerQuarterNote: 480,
      events: [
        {
          tick: 480,
          message: {
            kind: MidiMessageKinds.noteOff,
            channel: 0,
            note: 60,
            velocity: 0,
          },
        },
        {
          tick: 0,
          message: {
            kind: MidiMessageKinds.noteOn,
            channel: 0,
            note: 60,
            velocity: 100,
          },
        },
      ],
    };
  }
}

interface ScheduledAction {
  readonly delayMs: number;
  readonly sequence: number;
  readonly action: () => void;
  cancelled: boolean;
}

class ManualMidiStreamScheduler implements IMidiStreamScheduler {
  private nextSequence = 0;
  private readonly actions: ScheduledAction[] = [];

  public schedule(delayMs: number, action: () => void): MidiStreamSubscription {
    const scheduled: ScheduledAction = {
      delayMs,
      sequence: this.nextSequence,
      action,
      cancelled: false,
    };

    this.nextSequence += 1;
    this.actions.push(scheduled);

    return {
      cancel: (): void => {
        scheduled.cancelled = true;
      },
    };
  }

  public runAll(): void {
    const orderedActions = [...this.actions].sort((left, right) => {
      if (left.delayMs === right.delayMs) {
        return left.sequence - right.sequence;
      }

      return left.delayMs - right.delayMs;
    });

    for (const scheduled of orderedActions) {
      if (!scheduled.cancelled) {
        scheduled.action();
      }
    }
  }
}

class RecordingMidiStreamSink implements IMidiStreamSink {
  public readonly messages: MidiStreamMessage[] = [];
  public completed: MidiStreamCompleted | undefined = undefined;
  public failure: MidiStreamFailure | undefined = undefined;

  public send(event: MidiStreamMessage): void {
    this.messages.push(event);
  }

  public complete(event: MidiStreamCompleted): void {
    this.completed = event;
  }

  public fail(error: MidiStreamFailure): void {
    this.failure = error;
  }
}
