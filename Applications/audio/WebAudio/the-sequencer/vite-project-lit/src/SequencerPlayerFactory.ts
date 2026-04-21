import { WebAudioMidiPlayer, EnvelopeADSR, FilterSettings, FilterType } from "@monorepo/music-core-midi-playback";

export class SequencerPlayerFactory {
    public static createDefault(context: AudioContext): WebAudioMidiPlayer {
        return new WebAudioMidiPlayer({
            context,
            envelope: EnvelopeADSR.create(0.001, 0.08, 0.04, 0.1),
            filter: FilterSettings.create(FilterType.LowPass, 210, 1.2),
            filterEnvelope: EnvelopeADSR.create(0.001, 0.05, 0.1, 0.1),
            noteLengthSeconds: 0.11,
            detuneCents: 1,
            filterEnvAmount: 1.2,
            velocityToFilter: 0.2,
            subLevel: 0.46,
            panSpread: 0,
        });
    }
}
