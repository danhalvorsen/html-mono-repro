 
// import 'reflect-metadata';
 
// import { ServiceCollectionSyringe } from '@my-graphics/core-ioc';
// import { describe, it, expect } from 'vitest';
// import { DecoratorBasedHandlerRegistrar, IQuery, IQueryHandler, QueryDispatcher, QueryHandlerDecorator } from '@my-graphics/core.design-patterns';

// describe('QueryDispatcher', () => {
//   // Query definition
//   class GetAnswerQuery implements IQuery<GetAnswerQuery, number> {
//     commandName = 'GetAnswerQuery';
//   }

//   // Decorated handler
//   @QueryHandlerDecorator(GetAnswerQuery, 'singleton')
//   class GetAnswerHandler implements IQueryHandler<GetAnswerQuery, number> {
//     async handle(): Promise<number> {
//       return 42;
//     }
//   }

//   it('resolves and executes the correct query handler', async () => {
//     const services = new ServiceCollectionSyringe();
//     const registrar = new DecoratorBasedHandlerRegistrar(services);
//     registrar.register([GetAnswerHandler]);

//     const dispatcher = new QueryDispatcher(services);
//     const result = await dispatcher.dispatch(new GetAnswerQuery());

//     expect(result).toBe(42);
//   });

//   it('throws if no handler is registered for the query', async () => {
//     const services = new ServiceCollectionSyringe();
//     const dispatcher = new QueryDispatcher(services);

//     class MissingQuery implements IQuery<MissingQuery, string> {
//       commandName = 'MissingQuery';
//     }

//     await expect(dispatcher.dispatch(new MissingQuery())).rejects.toThrow();
//   });
// });
