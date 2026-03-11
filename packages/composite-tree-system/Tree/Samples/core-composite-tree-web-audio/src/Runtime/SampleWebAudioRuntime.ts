import { createSampleTree } from "../code.js";
import { WebAudioPlaybackSession } from "./WebAudioPlaybackSession.js";

/* ============================================================================
   Sample Runtime
   ============================================================================ */

export class SampleWebAudioRuntime {
    public constructor(
        private readonly playbackSession: WebAudioPlaybackSession = new WebAudioPlaybackSession()
    ) { }

    public async play(): Promise<void> {
        const root = createSampleTree();
        await this.playbackSession.play(root);
    }

    public stop(): void {
        this.playbackSession.stop();
    }

    public async dispose(): Promise<void> {
        await this.playbackSession.dispose();
    }
}
