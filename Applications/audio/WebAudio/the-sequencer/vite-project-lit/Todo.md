# TheToDo

## Architecture Goals

- [ ] The Lit application must not implement synth behavior. It should act as a sequencer controller and send MIDI streams to music-core-midi-playback.
- [ ] Sequencer application state, command handling, and event handling must live in modules/core-sequencer-application.
- [ ] The Lit app should consume reusable modules as building blocks and keep only host/composition concerns.

## Required Refactors

- [ ] Move SequencerHostApplication from vite-project-lit/src into modules/core-sequencer-application/src.
- [ ] Export SequencerHostApplication through modules/core-sequencer-application/src/index.ts.
- [ ] Replace local app-level orchestration in vite-project-lit/src/sequencer.ts with imports from core-sequencer-application.
- [ ] Remove or relocate local interfaces that represent application-layer concerns when equivalents belong in core-sequencer-application.

## Audio/MIDI Boundary

- [ ] Keep playback implementation behind an application port (IMidiStreamPlaybackPort).
- [ ] Ensure the sequencer provides MIDI stream data and does not own synth configuration logic in the UI host.
- [ ] If WebAudio-specific player factory logic remains, move it to an infrastructure adapter package, not the Lit host app.

## Validation Checklist

- [ ] Add/update tests in modules/core-sequencer-application for host orchestration behavior.
- [ ] Verify vite-project-lit composes controllers from core-sequencer-application without duplicating state machines.
- [ ] Run: pnpm --filter @monorepo/core-sequencer-application test
- [ ] Run: pnpm --dir Applications/audio/WebAudio/the-sequencer/vite-project-lit build

