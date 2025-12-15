# How to use it 

```
const serviceCollection = new ServiceCollectionSyringe();

// Register handlers
serviceCollection.register('CreateUserCommand', CreateUserHandler);
serviceCollection.register('GetUserByIdQuery', GetUserByIdHandler);

const commandDispatcher = new CommandDispatcher(serviceCollection);
const queryDispatcher = new QueryDispatcher(serviceCollection);

// Usage
await commandDispatcher.dispatch(new CreateUserCommand(...));
const user = await queryDispatcher.dispatch(new GetUserByIdQuery(..

```