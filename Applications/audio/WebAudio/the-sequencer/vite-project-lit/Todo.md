# TheToDo 

- application should not generate sound itself, the sequencer should send a midi stream to the 1. music-core-midi-playback module. The sequencer should be a midi controller, not a synth. 

- the sequencer should use the:C:\Users\danha\source\repos\HTML\MonoRepro\Applications\audio\WebAudio\the-sequencer\modules\core-sequencer-application for core modules for the syntesizer, and not implement its own state management, command handling, or event handling. The Lit3 application should consume other modules for building blocks, such as: 
Main module: SequencerHostApplication (C:\Users\danha\source\repos\HTML\MonoRepro\Applications\audio\WebAudio\the-sequencer\modules\core-sequencer-application) should be move to the C:\Users\danha\source\repos\HTML\MonoRepro\Applications\audio\WebAudio\the-sequencer\modules\core-sequencer-application

