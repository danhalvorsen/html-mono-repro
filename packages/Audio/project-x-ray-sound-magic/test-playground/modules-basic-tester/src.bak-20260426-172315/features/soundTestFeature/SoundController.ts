
import { createNoteOn, MidiChannel, MidiNote, MidiVelocity, createNoteOff } from "@monorepo/music-core-midi";
import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import { SynthEngine, StaticVoiceDefinitionProvider, NoteLifetimeCoordinator, EqualTemperamentMidiNoteFrequencyMapper, MidiMessageRouter } from "@monorepo/music-core-synthesizer-engine";
import { WebAudioContextFactory, WebAudioMasterBus, WebAudioVoiceGraphBuilder, WebAudioWhiteNoiseSourceFactory, WebAudioVoiceFactory, WebAudioEnvelopeScheduler } from "@monorepo/music-core-synthesizer-web-audio";
import { AudioContextTimeProvider } from "./AudioContextTimeProvider";

export class SoundController {
    private engine: SynthEngine | null = null;
    private voiceDefinitionProvider: StaticVoiceDefinitionProvider | null = null;

    public async init(voiceDef: IVoiceDefinition): Promise<void> {
        if (this.engine) {
            this.setVoiceDefinition(voiceDef);
            return;
        }

        const ctx = new WebAudioContextFactory().create();
        await ctx.resume();

        const master = new WebAudioMasterBus(ctx, 0.8);
        master.connect(ctx.destination);

        const graphBuilder = new WebAudioVoiceGraphBuilder(
            new WebAudioWhiteNoiseSourceFactory()
        );

        const voiceFactory = new WebAudioVoiceFactory(
            graphBuilder,
            new WebAudioEnvelopeScheduler()
        );

        const provider = new StaticVoiceDefinitionProvider(voiceDef);
        this.voiceDefinitionProvider = provider;

        const coordinator = new NoteLifetimeCoordinator({
            voiceFactory: {
                create: (r) => voiceFactory.create({
                    context: ctx,
                    destination: master.input,
                    definition: r.definition,
                    note: r.note,
                    velocity: r.velocity,
                    frequencyHz: r.frequencyHz,
                    startedAt: r.startedAt,
                }),
            },
            frequencyMapper: new EqualTemperamentMidiNoteFrequencyMapper(),
            voiceDefinitionProvider: provider,
        });

        const router = new MidiMessageRouter({
            timeProvider: new AudioContextTimeProvider(ctx),
            coordinator,
        });

        this.engine = new SynthEngine({ router, coordinator }, voiceDef);
    }

    public setVoiceDefinition(definition: IVoiceDefinition): void {
        this.voiceDefinitionProvider?.set(definition);
        this.engine?.setVoiceDefinition(definition);
    }

    public noteOn(note: number): void {
        this.engine?.handle(
            createNoteOn(
                MidiChannel.create(1),
                MidiNote.create(note),
                MidiVelocity.create(110)
            )
        );
    }

    public noteOff(note: number): void {
        this.engine?.handle(
            createNoteOff(
                MidiChannel.create(1),
                MidiNote.create(note),
                MidiVelocity.Zero
            )
        );
    }
}
