# audio-function-midi-streamer-web-audio

## Responsibility

Web Audio infrastructure adapter consuming MIDI stream events and forwarding them to Web Audio-backed synth ports.

## Package Role

This package belongs to the MIDI Streamer feature module group.

``text
audio-function-midi-streamer-contracts
audio-function-midi-streamer
audio-function-midi-streamer-ui
audio-function-midi-streamer-web-audio
``

## Architecture Rule

Keep dependencies pointing inward.

Domain/application code must not depend on DOM, Lit, Web Audio, or browser MIDI APIs.