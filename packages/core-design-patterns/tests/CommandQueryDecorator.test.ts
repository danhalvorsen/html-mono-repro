// // File: my-graphics-engine\packages\core.design-patterns\tests\CommandQueryDecorator.test.ts

// import { CommandHandlerDecorator, CQRS_METADATA, ICommand, IQuery, QueryHandlerDecorator } from '@my-graphics/core.design-patterns';
// import 'reflect-metadata';
 
// import { describe, it, expect } from 'vitest';

// describe('CQRS Decorators', () => {
//   class MyCommand implements ICommand<MyCommand, string> {
//     commandName = 'MyCommand';
//   }

//   class MyQuery implements IQuery<MyQuery, number> {
//     commandName = 'MyQuery';
//   }

//   it('should store metadata for CommandHandlerDecorator', () => {
//     @CommandHandlerDecorator(MyCommand, 'singleton')
//     class MyCommandHandler {}

//     expect(Reflect.getMetadata(CQRS_METADATA.handlerType, MyCommandHandler)).toBe('command');
//     expect(Reflect.getMetadata(CQRS_METADATA.commandName, MyCommandHandler)).toBe('MyCommand');
//     expect(Reflect.getMetadata(CQRS_METADATA.lifetime, MyCommandHandler)).toBe('singleton');
//   });

//   it('should store metadata for QueryHandlerDecorator', () => {
//     @QueryHandlerDecorator(MyQuery, 'transient')
//     class MyQueryHandler {}

//     expect(Reflect.getMetadata(CQRS_METADATA.handlerType, MyQueryHandler)).toBe('query');
//     expect(Reflect.getMetadata(CQRS_METADATA.commandName, MyQueryHandler)).toBe('MyQuery');
//     expect(Reflect.getMetadata(CQRS_METADATA.lifetime, MyQueryHandler)).toBe('transient');
//   });

//   it('should throw if commandName is missing', () => {
//     class BadCommand {
//       // missing commandName
//     }

//     expect(() => {
//       // @ts-expect-error intentional bad use
//       CommandHandlerDecorator(BadCommand)({}); 
//     }).toThrow(/missing/i);
//   });
// });
