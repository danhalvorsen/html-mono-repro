// import 'reflect-metadata';

// export const CQRS_METADATA = {
//   handlerType: 'cqrs:handlerType',
//   messageName: 'cqrs:messageName',
//   lifetime: 'cqrs:lifetime',
// };

// type Lifetime = 'singleton' | 'transient';

// function defineCQRSMetadata(
//   target: Function,
//   handlerType: 'command' | 'query',
//   messageName: string,
//   lifetime: Lifetime
// ) {
//   Reflect.defineMetadata(CQRS_METADATA.handlerType, handlerType, target);
//   Reflect.defineMetadata(CQRS_METADATA.messageName, messageName, target);
//   Reflect.defineMetadata(CQRS_METADATA.lifetime, lifetime, target);
// }
