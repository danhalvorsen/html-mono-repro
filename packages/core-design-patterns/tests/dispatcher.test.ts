// // File: my-graphics-engine\packages\core.design-patterns\tests\CommandDispatcher.test.ts

// import 'reflect-metadata';
// import { ServiceCollectionSyringe } from '@my-graphics/core-ioc';
// import { CommandDispatcher, CommandHandlerDecorator, ICommand, ICommandHandler } from '@my-graphics/core.design-patterns'
 
// import { describe, expect, it } from 'vitest';
 
// // -- Define a test command
// class HelloCommand implements ICommand<HelloCommand, string> {
//   commandName = 'HelloCommand';
//   constructor(public name: string = '') {}
// }

// // -- Define a handler with the decorator
// @CommandHandlerDecorator(HelloCommand)
// class HelloCommandHandler implements ICommandHandler<HelloCommand, string> {
//   async handle(command: HelloCommand): Promise<string> {
//     return `Hello, ${command.name}`;
//   }
// }

// describe('CommandDispatcher with IoC + Decorator', () => {
//   it('should resolve handler via commandName and execute it', async () => {
//     // Arrange
//     const services = new ServiceCollectionSyringe();
//     const scanner = new HandlerScanner(services);
//     scanner.registerHandlers([
//       HelloCommandHandler
//     ]);

//     const dispatcher = new CommandDispatcher(services);
//     const command = new HelloCommand('World');

//     // Act
//     const result = await dispatcher.dispatch(command);

//     // Assert
//     expect(result).toBe('Hello, World');
//   });
// });
