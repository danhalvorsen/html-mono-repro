// import { ICommandHandler } from "../src/command-query/ICommandHandler";
// // File: my-graphics-engine\packages\core.design-patterns\tests\DecoratorBasedHandlerRegistrar.test.ts

// import 'reflect-metadata';
 
// import type { IServiceCollection } from '@my-graphics/core-ioc';
// import { describe, it, expect } from 'vitest';
// import { CommandHandlerDecorator, DecoratorBasedHandlerRegistrar, ICommand, IQuery, IQueryHandler, QueryHandlerDecorator } from '@my-graphics/core.design-patterns';

// class FakeServiceCollection implements IServiceCollection {
//   public registrations: { identifier: string; type: any; scope: string }[] = [];

//   register<T>(identifier: string, type: new (...args: any[]) => T, scope: 'singleton' | 'transient' = 'transient'): void {
//     this.registrations.push({ identifier, type, scope });
//   }

//   registerInstance<T>(): void {
//     throw new Error('Not used in this test');
//   }

//   resolve<T>(): T {
//     throw new Error('Not used in this test');
//   }
// }

// describe('DecoratorBasedHandlerRegistrar', () => {
//   const setup = () => {
//     const services = new FakeServiceCollection();
//     const registrar = new DecoratorBasedHandlerRegistrar(services);
//     return { services, registrar };
//   };

//   class GreetCommand implements ICommand<GreetCommand, string> {
//     commandName = 'GreetCommand';
//     constructor(public name: string = '') {}
//   }

//   @CommandHandlerDecorator(GreetCommand, 'singleton')
//   class GreetHandler implements ICommandHandler<GreetCommand, string> {
//     async handle(command: GreetCommand): Promise<string> {
//       return `Hello ${command.name}`;
//     }
//   }

//   class GetNumberQuery implements IQuery<GetNumberQuery, number> {
//     commandName = 'GetNumberQuery';
//   }

//   @QueryHandlerDecorator(GetNumberQuery, 'transient')
//   class GetNumberHandler implements IQueryHandler<GetNumberQuery, number> {
//     async handle(): Promise<number> {
//       return 42;
//     }
//   }

//   it.each([
//     ['GreetHandler (singleton)', GreetHandler, 'GreetCommand', 'singleton'],
//     ['GetNumberHandler (transient)', GetNumberHandler, 'GetNumberQuery', 'transient']
//   ])('registers %s via decorator', (_desc, handlerClass, expectedName, expectedScope) => {
//     const { services, registrar } = setup();
//     registrar.register([handlerClass]);
//     expect(services.registrations).toContainEqual({
//       identifier: expectedName,
//       type: handlerClass,
//       scope: expectedScope
//     });
//   });

//   it('ignores undecorated classes', () => {
//     class NotAHandler {}
//     const { services, registrar } = setup();
//     registrar.register([NotAHandler]);
//     expect(services.registrations.length).toBe(0);
//   });
// });
