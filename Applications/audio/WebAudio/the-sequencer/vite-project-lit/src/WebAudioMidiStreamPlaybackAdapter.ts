import { MidiStringParser, MidiChannel, type ParsedStep, type MidiMessage, createNoteOn, MidiNote, MidiVelocity } from "@monorepo/music-core-midi";
import type { WebAudioMidiPlayer, MidiPlaybackOptions } from "@monorepo/music-core-midi-playback";
import type { IMidiStreamPlaybackPort, ISequencerMidiStreamProvider } from "../../modules/core-sequencer-application/src";
import { Delay } from "./sequencer";
import { ISequencerPlaybackFrameProvider } from "./ISequencerPlaybackFrameProvider";

export class WebAudioMidiStreamPlaybackAdapter implements IMidiStreamPlaybackPort {
    private static readonly defaultVelocity = 112;
    private readonly parser = new MidiStringParser();
    private readonly player: WebAudioMidiPlayer;
    private readonly streamProvider?: ISequencerMidiStreamProvider;
    private readonly onStepChanged?: (stepIndex: number) => void;
    private readonly midiChannel: MidiChannel;
    private activeRunId = 0;
    private currentStream = "";

    public constructor(
        player: WebAudioMidiPlayer,
        dependencies: {
            readonly streamProvider?: ISequencerMidiStreamProvider;
            readonly onStepChanged?: (stepIndex: number) => void;
        } = {}
    ) {
        this.player = player;
        this.streamProvider = dependencies.streamProvider;
        this.onStepChanged = dependencies.onStepChanged;
        this.midiChannel = MidiChannel.create(1);
    }

    public async start(midiStream: string): Promise<void> {
        this.activeRunId += 1;
        const runId = this.activeRunId;
        this.currentStream = midiStream;

        void this.playLoop(runId);
    }

    public async stop(): Promise<void> {
        this.activeRunId += 1;
        this.onStepChanged?.(-1);
    }

    private async playLoop(runId: number): Promise<void> {
        while (this.activeRunId === runId) {
            if (this.isPlaybackFrameProvider(this.streamProvider)) {
                const frame = this.streamProvider.getPlaybackFrame();

                if (frame.steps.length === 0) {
                    await Delay.wait(50);
                    continue;
                }

                for (const step of frame.steps) {
                    if (this.activeRunId !== runId) {
                        return;
                    }

                    this.onStepChanged?.(step.stepIndex);

                    if (step.notes.length > 0) {
                        for (const noteNumber of step.notes) {
                            const noteMessage = this.tryCreateNoteMessage(noteNumber);
                            if (!noteMessage) {
                                continue;
                            }

                            this.player.play(noteMessage, {
                                noteLengthSeconds: Math.max(0.03, step.holdMs / 1000),
                            });
                        }
                    }

                    await Delay.wait(step.holdMs);
                }

                continue;
            }

            const latestStream = this.resolveLatestStream();
            const steps = this.parser.parse(latestStream);

            if (steps.length === 0) {
                await Delay.wait(50);
                continue;
            }

            for (const step of steps) {
                if (this.activeRunId !== runId) {
                    return;
                }

                if (step.message !== null) {
                    this.player.play(step.message, this.toPlaybackOptions(step));
                }

                await Delay.wait(step.holdMs);
            }
        }
    }

    private resolveLatestStream(): string {
        const nextStream = this.streamProvider?.buildStream() ?? this.currentStream;
        this.currentStream = nextStream;
        return nextStream;
    }

    private toPlaybackOptions(step: ParsedStep): MidiPlaybackOptions {
        return {
            noteLengthSeconds: Math.max(0.03, step.holdMs / 1000),
            ...(step.filterInfo1 !== undefined
                ? { filterFrequency: step.filterInfo1 }
                : {}),
            ...(step.filterInfo2 !== undefined ? { filterQ: step.filterInfo2 } : {}),
            ...(step.sustain !== undefined ? { sustain: step.sustain } : {}),
        };
    }

    private isPlaybackFrameProvider(
        provider: ISequencerMidiStreamProvider | undefined
    ): provider is ISequencerPlaybackFrameProvider {
        return provider !== undefined && "getPlaybackFrame" in provider;
    }

    private tryCreateNoteMessage(noteNumber: number): MidiMessage | undefined {
        if (!Number.isFinite(noteNumber)) {
            return undefined;
        }

        try {
            return createNoteOn(
                this.midiChannel,
                MidiNote.create(Math.floor(noteNumber)),
                MidiVelocity.create(WebAudioMidiStreamPlaybackAdapter.defaultVelocity)
            );
        } catch {
            return undefined;
        }
    }
}
