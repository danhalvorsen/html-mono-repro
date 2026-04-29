# audio-function-midi-streamer-contracts

## Responsibility

Public contracts, DTOs, stream event types, ports, and MIDI song/message abstractions. No runtime implementation.

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