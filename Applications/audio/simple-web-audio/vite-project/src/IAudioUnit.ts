import type { IAudioInput } from "./Inputs/IAudioInput";
import type { IAudioOutput } from "./Inputs/IAudioOutput";

export interface IAudioUnit extends IAudioInput, IAudioOutput {}