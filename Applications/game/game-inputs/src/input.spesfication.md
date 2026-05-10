/*
When implementing the input specification, the following contract must 
 the following: C:\Users\danha\source\repos\HTML\MonoRepro\Applications\game\game-scroller\src\for.ai.md

/*

As a PlayerGameObject (C:\Users\danha\source\repos\HTML\MonoRepro\Applications\game\game-scroller\src\GameObjects\PlayerGameObject.ts) I want a reactive controller to handle user input  so that I can update my position and state based on user interactions

I will receive input from the user(s) and update my state accordingly.   
The input can be from various sources, such as keyboard, mouse, or gamepad.

 I will process the input and translate it into actions that affect my behavior in the game world.   

This specification concentrates on the input for a keyboard, but the design should be extensible to support other input sources in the future.  

The input handling should be decoupled from the game logic, allowing for flexibility and maintainability.               
The input handling should be implemented as a Lit3 Reactive Controller.

As a PlayerGameObject I want a a PlayerInputController for taking care about the keyboard input concern, so that the position and state of the player can be updated based on user interactions.
