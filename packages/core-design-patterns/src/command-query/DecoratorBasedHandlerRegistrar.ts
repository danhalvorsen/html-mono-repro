// // File: my-graphics-engine\packages\core.design-patterns\src\command-query\DecoratorBasedHandlerRegistrar.ts
// import 'reflect-metadata';

// import { IServiceCollection } from '@my-graphics/core-ioc';
// import { ICommand } from './ICommand';
// import { CQRS_METADATA } from './Decorators/Decorators';
// ;

// export class DecoratorBasedHandlerRegistrar {
//   constructor(private readonly services: IServiceCollection) {}

//   register(types: Function[]): void {
//     for (const type of types) {
//       const commandName = Reflect.getMetadata(CQRS_METADATA.commandName, type);
//       const handlerType = Reflect.getMetadata(CQRS_METADATA.handlerType, type);
//       const lifetime = Reflect.getMetadata(CQRS_METADATA.lifetime, type) || 'transient';

//       if (!commandName || !handlerType) continue;

//       this.services.register(commandName, type as any, lifetime);
//     }
//   }
// }
