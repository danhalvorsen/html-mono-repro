# Audio Function MIDI Streamer Modules

## Package Set

``text
audio-function-midi-streamer-contracts
audio-function-midi-streamer
audio-function-midi-streamer-ui
audio-function-midi-streamer-web-audio
``

## Responsibility Split

| Package | Responsibility |
|---|---|
| `audio-function-midi-streamer-contracts` | Public contracts, MIDI song model, stream sink/source ports, DOM event constants. |
| `audio-function-midi-streamer` | Domain/application MIDI streaming orchestration. No DOM. No Web Audio. |
| `audio-function-midi-streamer-ui` | Lit 3 Web Component with song dropdown and slotted MIDI data event stream. |
| `audio-function-midi-streamer-web-audio` | Web Audio sink that consumes streamed MIDI events. |

## Flow

``text
JSON song catalog
    ->
<audio-function-midi-streamer>
    ->
song dropdown selection
    ->
IMidiSongStreamer
    ->
IMidiStreamSink
    ->
CustomEvent stream to slotted/listening components
    ->
optional WebAudioMidiStreamSink
``

## Web Component

``html
<audio-function-midi-streamer song-source-url="/midi-songs.json">
  <some-midi-listener slot="midi-data"></some-midi-listener>
</audio-function-midi-streamer>
``

The component dispatches these typed DOM events:

``text
audio-function-midi-streamer:songs-loaded
audio-function-midi-streamer:song-selected
audio-function-midi-streamer:midi-message
audio-function-midi-streamer:stream-completed
audio-function-midi-streamer:stream-failed
``