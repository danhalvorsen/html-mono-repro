# Tangent 

## Should should be a personal choice

The Tangent should not have a midi player that belongs to the piano (or the root component) The Tangent -> Octave -> Piano 

Midiplayer: @monorepo/music-core-midi-playback  
MidiMessage: @monorepo/music-core-midi  
- When onclick is process of playing a note staring, the "midiplayer"  package is the playeer, and we sending a onPressed? event to the 
(That is a midi message and there is midi message in  "  MidiMessage) when the onClick is released a new midi message is send to  MidiMessage

