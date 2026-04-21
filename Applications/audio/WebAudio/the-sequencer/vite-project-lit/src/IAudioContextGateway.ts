
export interface IAudioContextGateway {
    readonly context: AudioContext;
    resumeOnUserGesture(): Promise<void>;
}
