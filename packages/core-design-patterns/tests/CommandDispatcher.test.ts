// // File: my-graphics-engine\packages\core.design-patterns\tests\CommandDispatcher.test.ts

// import 'reflect-metadata';
 
// import { ServiceCollectionSyringe } from '@my-graphics/core-ioc';
// import { describe, it, expect } from 'vitest';
// import { CommandDispatcher, CommandHandlerDecorator, DecoratorBasedHandlerRegistrar, ICommand, ICommandHandler } from '@my-graphics/core.design-patterns';

// describe('CommandDispatcher', () => {
//   class PingCommand implements ICommand<PingCommand, string> {
//     commandName = 'PingCommand';
//     constructor(public message: string = 'ping') {}
//   }

//   @CommandHandlerDecorator(PingCommand, 'transient')
//   class PingHandler implements ICommandHandler<PingCommand, string> {
//     async handle(command: PingCommand): Promise<string> {
//       return `PONG: ${command.message}`;
//     }
//   }

//   it('resolves and executes the correct command handler', async () => {
//     const services = new ServiceCollectionSyringe();
//     const registrar = new DecoratorBasedHandlerRegistrar(services);
//     registrar.register([PingHandler]);

//     const dispatcher = new CommandDispatcher(services);
//     const result = await dispatcher.dispatch(new PingCommand('hello'));

//     expect(result).toBe('PONG: hello');
//   });

//   it('throws if no handler is registered for the command', async () => {
//     const services = new ServiceCollectionSyringe();
//     const dispatcher = new CommandDispatcher(services);

//     class UnknownCommand implements ICommand<UnknownCommand, void> {
//       commandName = 'UnknownCommand';
//     }

//     await expect(dispatcher.dispatch(new UnknownCommand())).rejects.toThrow();
//   });
// });
