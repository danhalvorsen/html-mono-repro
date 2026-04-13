// packages/Audio/music-core-synthesizer/src/domain.ts

import {
  MuteState as GeneratedMuteState,
  StepState as GeneratedStepState,
  TrackKind as GeneratedTrackKind,
} from "./generated/schema-types.js";
import type { components } from "./generated/schema-types.js";

export type SchemaVersion = components["schemas"]["SchemaVersion"];
export type MuteState = `${GeneratedMuteState}`;
export type StepState = `${GeneratedStepState}`;
export type TrackKind = `${GeneratedTrackKind}`;

export type ISampleComponent = components["schemas"]["SampleComponent"];
export type ISampleWindow = components["schemas"]["SampleWindow"];
export type IPlaybackSettings = components["schemas"]["PlaybackSettings"];
export type IProjectComponents = components["schemas"]["ProjectComponents"];
export type ITrackDefaults = components["schemas"]["TrackDefaults"];
export type IStep = components["schemas"]["Step"];
export type ITrack = components["schemas"]["Track"];
export type IPattern = components["schemas"]["Pattern"];
export type IProject = components["schemas"]["Project"];
export type ISequencerProjectDocument =
  components["schemas"]["SequencerProjectDocument"];
