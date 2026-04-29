import type {
  IMidiSongStreamer,
  IMidiStreamScheduler,
  IMidiStreamSink,
  MidiSong,
  MidiStreamSubscription,
  MidiTimedMessage,
} from "@monorepo/audio-function-midi-streamer-contracts";
import { MidiSongValidator } from "../domain/MidiSongValidator.js";

export class MidiSongStreamer implements IMidiSongStreamer {
  public constructor(
    private readonly scheduler: IMidiStreamScheduler,
    private readonly validator: MidiSongValidator,
  ) {}

  public stream(song: MidiSong, sink: IMidiStreamSink): MidiStreamSubscription {
    this.validator.validate(song);

    const scheduledSubscriptions: MidiStreamSubscription[] = [];
    const orderedEvents = this.orderEvents(song.events);
    const playback = new CompositeMidiStreamSubscription(scheduledSubscriptions);

    for (const [index, event] of orderedEvents.entries()) {
      const delayMs = this.convertTickToDelayMs(event.tick, song);

      scheduledSubscriptions.push(
        this.scheduler.schedule(delayMs, () => {
          if (playback.isCancelled()) {
            return;
          }

          sink.send({
            songId: song.id,
            eventIndex: index,
            tick: event.tick,
            delayMs,
            message: event.message,
          });
        }),
      );
    }

    const lastEvent = orderedEvents[orderedEvents.length - 1];

    if (lastEvent === undefined) {
      return playback;
    }

    const completionDelayMs = this.convertTickToDelayMs(lastEvent.tick + 1, song);

    scheduledSubscriptions.push(
      this.scheduler.schedule(completionDelayMs, () => {
        if (playback.isCancelled()) {
          return;
        }

        sink.complete({
          songId: song.id,
          eventCount: orderedEvents.length,
        });
      }),
    );

    return playback;
  }

  private orderEvents(events: readonly MidiTimedMessage[]): readonly MidiTimedMessage[] {
    return [...events].sort((left, right) => left.tick - right.tick);
  }

  private convertTickToDelayMs(tick: number, song: MidiSong): number {
    const quarterNotes = tick / song.ticksPerQuarterNote;
    const millisecondsPerQuarterNote = 60_000 / song.tempoBpm;

    return quarterNotes * millisecondsPerQuarterNote;
  }
}

class CompositeMidiStreamSubscription implements MidiStreamSubscription {
  private cancelled = false;

  public constructor(
    private readonly subscriptions: readonly MidiStreamSubscription[],
  ) {}

  public cancel(): void {
    if (this.cancelled) {
      return;
    }

    this.cancelled = true;

    for (const subscription of this.subscriptions) {
      subscription.cancel();
    }
  }

  public isCancelled(): boolean {
    return this.cancelled;
  }
}
