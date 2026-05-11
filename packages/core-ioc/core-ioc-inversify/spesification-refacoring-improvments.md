```gherkin
Feature: Custom IoC Container Public API

  The IoC system must expose a C# IServiceCollection-inspired façade.
  Application code must register and resolve services through type-based public APIs.
  The public API must not expose Inversify, reflect-metadata, bindings, containers, metadata keys,
  engine decorators, or magic-string service identifiers.

  Background:
    Given an empty ServiceCollection
    And the ServiceCollection uses an internal adapter backed by an external DI engine
    And the default engine is Inversify
    And application code interacts only with the IoC façade

  @must
  Rule: Public API follows C# IServiceCollection semantics

    Scenario: Register singleton service by implementation type
      When I call AddSingleton with service type ConsoleLogger
      Then the ServiceCollection must contain one descriptor
      And the descriptor service type must be ConsoleLogger
      And the descriptor implementation type must be ConsoleLogger
      And the descriptor lifetime must be Singleton

    Scenario: Register singleton service with abstraction and implementation
      When I call AddSingleton with service type ILogger and implementation type ConsoleLogger
      Then the ServiceCollection must contain one descriptor
      And the descriptor service type must be ILogger
      And the descriptor implementation type must be ConsoleLogger
      And the descriptor lifetime must be Singleton

    Scenario: Register scoped service
      When I call AddScoped with service type IUnitOfWork and implementation type SqlUnitOfWork
      Then the ServiceCollection must contain one descriptor
      And the descriptor lifetime must be Scoped

    Scenario: Register transient service
      When I call AddTransient with service type IUserService and implementation type UserService
      Then the ServiceCollection must contain one descriptor
      And the descriptor lifetime must be Transient

    Scenario: Register singleton instance
      Given an existing instance of ConsoleLogger
      When I call AddSingletonInstance with service type ILogger and the instance
      Then the ServiceCollection must contain one descriptor
      And the descriptor service type must be ILogger
      And the descriptor instance must be the provided instance
      And the descriptor lifetime must be Singleton

    Scenario: Register service factory
      Given a factory for IUserService exists
      When I call AddTransient with service type IUserService and the factory
      Then the ServiceCollection must contain one descriptor
      And the descriptor service type must be IUserService
      And the descriptor factory must be the provided factory
      And the descriptor lifetime must be Transient

  @must
  Rule: Public API follows C# IServiceProvider semantics

    Scenario: Build service provider
      Given the ServiceCollection contains registered descriptors
      When I call BuildServiceProvider
      Then a ServiceProvider must be returned
      And the ServiceProvider must expose only façade-defined APIs

    Scenario: Resolve required service
      Given ILogger is registered as ConsoleLogger
      And the ServiceProvider has been built
      When I call GetRequiredService with service type ILogger
      Then an instance of ConsoleLogger must be returned

    Scenario: Required service is missing
      Given ILogger is not registered
      And the ServiceProvider has been built
      When I call GetRequiredService with service type ILogger
      Then an IoC service resolution error must be thrown

    Scenario: Optional service is missing
      Given ILogger is not registered
      And the ServiceProvider has been built
      When I call GetService with service type ILogger
      Then no service instance must be returned

    Scenario: Create service scope
      Given the ServiceProvider has been built
      When I call CreateScope
      Then a ServiceScope must be returned
      And the ServiceScope must expose a scoped ServiceProvider
      And no engine-specific scope object must be exposed

  @must
  Rule: Public service identity is type-based

    Scenario: Register service using runtime class
      When I register ConsoleLogger as a service
      Then ConsoleLogger must be the public service identity
      And no string identifier must be required

    Scenario: Register service using abstract class
      When I register ILogger with implementation ConsoleLogger
      Then ILogger must be the public service identity
      And ConsoleLogger must be the implementation type

    Scenario: Register erased TypeScript interface through runtime identity
      Given a TypeScript interface has no runtime representation
      When the interface must be used as a service identity
      Then the IoC system may use a strongly typed runtime identity object
      And the identity may be symbol-backed
      And the identity must behave like a runtime type in public APIs
      And the identity must not be a string token
      And the identity must not be a raw engine token

    Scenario: Reject string-based registration
      When application code attempts to register a service using a string identifier
      Then registration must fail
      And the error must explain that string service identifiers are not supported

    Scenario: Reject manually supplied descriptor identity
      When application code attempts to provide a descriptor identity manually
      Then registration must fail
      And the error must explain that descriptor identities are generated internally

  @must
  Rule: Lifetimes behave deterministically

    Scenario: Singleton returns same instance
      Given ILogger is registered as Singleton ConsoleLogger
      And the ServiceProvider has been built
      When I resolve ILogger twice from the same provider
      Then both resolved values must reference the same instance

    Scenario: Transient returns new instance
      Given IUserService is registered as Transient UserService
      And the ServiceProvider has been built
      When I resolve IUserService twice from the same provider
      Then each resolved value must reference a different instance

    Scenario: Scoped returns same instance inside one scope
      Given IUnitOfWork is registered as Scoped SqlUnitOfWork
      And a service scope has been created
      When I resolve IUnitOfWork twice from the scoped provider
      Then both resolved values must reference the same instance

    Scenario: Scoped returns different instances across scopes
      Given IUnitOfWork is registered as Scoped SqlUnitOfWork
      And two service scopes have been created
      When I resolve IUnitOfWork from each scope
      Then the resolved values must reference different instances

  @must
  Rule: Internal descriptor identity is registry-generated

    Scenario: Descriptor receives generated identity
      When a service is registered
      Then the registry must generate an internal descriptor identity
      And the identity must be deterministic
      And the identity must not be supplied by application code

    Scenario: Descriptor identity uses stable metadata
      When ILogger is registered as Singleton ConsoleLogger
      Then the internal descriptor identity must be generated from:
        | metadata               |
        | service identity        |
        | implementation identity |
        | lifetime                |
        | registration kind       |
        | collision index         |

    Scenario: Descriptor identity collision is resolved deterministically
      Given a generated descriptor identity collides with an existing descriptor identity
      When the registry detects the collision
      Then the registry must increment the collision index
      And the registry must generate a new identity
      And the process must repeat until the identity is unique

    Scenario: Descriptor identity is diagnostic only
      Given a descriptor has an internal identity
      When diagnostics are requested
      Then the identity may be shown as an internal descriptor identity
      And the identity must not be shown as a public service token

  @should
  Rule: Constructor injection is supported through internal metadata

    Scenario: Resolve constructor dependency
      Given ILogger is registered as Singleton ConsoleLogger
      And IUserService is registered as Transient UserService
      And UserService requires ILogger in its constructor
      And constructor metadata exists for UserService
      When I resolve IUserService
      Then UserService must be created
      And its ILogger dependency must be ConsoleLogger

    Scenario: Missing constructor metadata fails deterministically
      Given UserService requires constructor dependencies
      And constructor metadata is missing for UserService
      When I resolve IUserService
      Then resolution must fail
      And the error must identify the implementation type
      And the error must explain that constructor metadata is missing

    Scenario: Missing constructor dependency fails deterministically
      Given IUserService is registered as Transient UserService
      And UserService requires ILogger in its constructor
      And ILogger is not registered
      When I resolve IUserService
      Then resolution must fail
      And the error must include the missing dependency type
      And the error must include the dependency chain when available

  @could
  Rule: Lazy initialization may be supported

    Scenario: Lazy singleton is not created before first resolution
      Given IHeavyService is registered as Lazy Singleton HeavyService
      When BuildServiceProvider is called
      Then HeavyService must not be instantiated immediately
      When IHeavyService is first resolved
      Then HeavyService must be instantiated once
```

```gherkin
Feature: Internal Inversify Adapter

  The IoC system may use Inversify and reflect-metadata internally.
  Inversify and reflect-metadata must be hidden behind a strict adapter boundary.
  Application code must never import or depend on Inversify, reflect-metadata, or engine concepts.

  Background:
    Given the default adapter is an Inversify-backed adapter
    And the adapter is configured by the composition root
    And application code uses only the IoC façade

  @must
  Rule: Adapter is the only module allowed to depend on the DI engine

    Scenario: Only adapter imports Inversify
      When the package modules are inspected
      Then only adapter modules may import "inversify"
      And no façade module may import "inversify"

    Scenario: Only adapter imports reflect-metadata
      When the package modules are inspected
      Then only adapter modules may import "reflect-metadata"
      And no façade module may import "reflect-metadata"

    Scenario: Façade modules do not reference engine types
      When façade modules are inspected
      Then no façade module must reference Inversify Container
      And no façade module must reference Inversify Binding
      And no façade module must reference reflect-metadata keys

  @must
  Rule: Adapter translates descriptors into engine registrations

    Scenario: Register descriptor through adapter
      Given a ServiceDescriptor exists
      When registerDescriptor is called on the adapter
      Then the adapter must store the descriptor for binding
      And the adapter must not mutate the descriptor

    Scenario: Build provider through adapter
      Given descriptors have been registered with the adapter
      When buildProvider is called
      Then the adapter must bind all descriptors before returning
      And the adapter must return a façade ServiceProvider abstraction

    Scenario: Create scope through adapter
      Given a provider has been built
      When createScope is called on the adapter
      Then the adapter must create an internal scope representation
      And the adapter must return a façade ServiceScope abstraction

    Scenario: Resolve service through adapter
      Given a provider has been built
      When resolve is called with a public service identity
      Then the adapter must resolve the service internally
      And the adapter must return only the resolved service instance

  @must
  Rule: Adapter does not expose engine objects

    Scenario: Provider result hides engine container
      When buildProvider returns
      Then the returned object must not expose an Inversify Container
      And the returned object must not expose binding APIs
      And the returned object must not expose engine lifecycle APIs

    Scenario: Scope result hides engine scope implementation
      When createScope returns
      Then the returned object must not expose engine scope objects
      And the returned object must not expose engine-specific scope semantics

    Scenario: Resolution result hides engine metadata
      When a service is resolved
      Then only the resolved service instance must be returned
      And no engine metadata must be returned

  @must
  Rule: reflect-metadata usage is internal and validated

    Scenario: Adapter reads constructor parameter metadata internally
      Given UserService has constructor dependencies
      When UserService is resolved
      Then the adapter may read constructor metadata using design:paramtypes
      And metadata access must happen inside the adapter only

    Scenario: Metadata access is validated
      Given constructor metadata is required
      When constructor metadata is read
      Then the adapter must validate that metadata exists
      And missing metadata must produce a deterministic IoC error

    Scenario: Metadata keys do not leak
      When constructor metadata is inspected internally
      Then metadata keys must not be exposed through the public API
      And Reflect.getMetadata must not be exposed through the public API

    Scenario: Metadata cache does not leak mutable state
      Given a new ServiceProvider is built
      When constructor metadata is inspected
      Then metadata state from another provider must not affect the result
      And deterministic adapter-local caching may be used
      And mutable metadata cache state must not leak across providers

  @must
  Rule: Engine errors are wrapped

    Scenario: Wrap engine resolution error
      Given the internal engine throws a resolution error
      When the error crosses the adapter boundary
      Then the adapter must throw an IoC-specific resolution error
      And the public error must not expose the original engine error type

    Scenario: Wrap engine binding error
      Given the internal engine throws a binding error
      When BuildServiceProvider is called
      Then the adapter must throw an IoC-specific build error
      And the public error must reference the relevant descriptor

    Scenario: Sanitize public error
      Given an internal engine error occurs
      When the error is exposed to application code
      Then the exposed error must not contain engine stack frames
      And the exposed error must not contain engine terminology

  @must
  Rule: Adapter is replaceable

    Scenario: Replace DI engine adapter
      Given an alternative adapter implementation exists
      When the composition root configures the alternative adapter
      Then application code must not change
      And the public ServiceCollection API must not change
      And the public ServiceProvider API must not change

    Scenario: Replace metadata provider
      Given an alternative metadata provider exists
      When the adapter is replaced
      Then constructor injection semantics must remain unchanged
      And public registration semantics must remain unchanged
      And public resolution semantics must remain unchanged

  @must
  Rule: Adapter is mockable

    Scenario: Composition root injects adapter
      Given a mock adapter exists
      When the composition root creates a ServiceCollection
      Then the mock adapter may be supplied
      And public API behavior must remain unchanged

    Scenario: Tests replace adapter with mock
      Given a test verifies descriptor forwarding
      When the ServiceCollection is built with a mock adapter
      Then the test must be able to assert descriptors passed to the adapter
      And the test must not require Inversify
```

```gherkin
Feature: Cross-Cutting IoC Architecture Rules

  The IoC system must preserve strict separation between façade, registry, adapter, and engine.
  These rules apply across all IoC features.

  Background:
    Given application code interacts with the IoC façade
    And the façade creates ServiceDescriptor entries
    And the registry assigns internal descriptor identities
    And the adapter translates descriptors into engine registrations
    And the engine performs service construction and lifecycle resolution

  @must
  Rule: Façade, registry, adapter, and engine are separated

    Scenario: Façade owns public semantics
      When application code registers or resolves services
      Then only façade semantics must be visible
      And no adapter semantics must be visible
      And no engine semantics must be visible

    Scenario: Registry owns internal identity
      When a descriptor is created
      Then the registry must assign the internal descriptor identity
      And the adapter must not create public service identities
      And the engine must not define public service identities

    Scenario: Adapter owns translation
      When descriptors are passed to the adapter
      Then the adapter must translate descriptors into engine registrations
      And the façade must not perform engine translation
      And the registry must not perform engine translation

    Scenario: Engine owns construction
      When a service instance is created
      Then the engine must construct it
      And the façade must not construct services directly
      And the registry must not construct services directly

  @must
  Rule: No engine concept may cross the façade boundary

    Scenario: Engine concepts are not exposed
      When application code imports the IoC package
      Then no engine container types must be exposed
      And no engine binding types must be exposed
      And no engine metadata APIs must be exposed
      And no engine decorators must be exposed
      And no engine lifecycle APIs must be exposed

    Scenario: Engine decorators are not required
      When application code defines services
      Then @injectable must not be required
      And @inject must not be required
      And no engine decorator must be required

    Scenario: Engine configuration is not exposed
      When application code imports the IoC package
      Then no engine configuration API must be exposed
      And no binding configuration API must be exposed
      And no metadata configuration API must be exposed

  @must
  Rule: Descriptors are immutable and flow unchanged

    Scenario: Descriptor creation
      When a descriptor is created
      Then the descriptor must be immutable
      And the descriptor must contain façade-level metadata
      And the descriptor must contain an internal descriptor identity

    Scenario: Descriptor forwarding
      Given descriptors have been created
      When descriptors are passed to the adapter
      Then the adapter must receive them unchanged
      And the adapter must preserve registration order
      And the adapter must not mutate them

    Scenario: Descriptor binding
      When the adapter binds descriptors
      Then binding must be based only on descriptor metadata
      And no additional public metadata may be inferred
      And no additional public identity may be injected

    Scenario: Descriptor diagnostics
      When diagnostics are requested
      Then diagnostics must report descriptor metadata from the registry
      And diagnostics must not inspect engine bindings

  @must
  Rule: BuildServiceProvider is the deterministic boundary between registration and resolution

    Scenario: Pre-build collection is mutable
      Given BuildServiceProvider has not been called
      When application code adds a descriptor
      Then the descriptor must be added to the ServiceCollection

    Scenario: Build freezes collection and binds descriptors
      When BuildServiceProvider is called
      Then the ServiceCollection must become frozen
      And all descriptors must be forwarded to the adapter
      And the adapter must bind all descriptors before returning the provider

    Scenario: Post-build collection is frozen
      Given BuildServiceProvider has completed successfully
      When application code attempts to add another descriptor
      Then the operation must fail
      And no descriptor must be added

    Scenario: Post-build descriptors remain immutable
      Given BuildServiceProvider has completed successfully
      When application code attempts to mutate an existing descriptor
      Then the mutation must fail
      And the descriptor must remain unchanged

    Scenario: Resolution does not mutate registration state
      Given the ServiceProvider has been built
      When a service is resolved
      Then no descriptor must be added
      And no descriptor must be mutated
      And no engine binding must be created during resolution

    Scenario: Build does not depend on global engine state
      Given the same descriptors are registered in the same order
      When BuildServiceProvider is called multiple times
      Then equivalent providers must be produced
      And the result must not depend on global DI engine state

  @must
  Rule: Public identity is type-based and internal identity is registry-generated

    Scenario: Public identity
      When a service is registered
      Then the public identity must be a runtime class, abstract class, or strongly typed runtime identity
      And the public identity must not be a string token
      And the public identity must not be an engine token

    Scenario: Internal identity
      When a descriptor is created
      Then the registry must generate a deterministic internal descriptor identity
      And application code must not supply the internal identity

    Scenario: Identity isolation
      When diagnostics are shown
      Then internal identities must be described as internal descriptor identities
      And public identities must remain type-based
      And internal identities must not be described as service tokens

  @must
  Rule: Public errors use unified IoC vocabulary

    Scenario: Resolution error
      When resolution fails
      Then the error must reference the service type
      And the error must reference the implementation type when known
      And the error must reference the lifetime when relevant
      And the error must reference the dependency chain when available
      And the error must not reference engine terminology

    Scenario: Binding error
      When adapter binding fails
      Then the error must reference the descriptor
      And the error must reference the internal descriptor identity
      And the error must not reference engine bindings

    Scenario: Metadata error
      When constructor metadata is missing
      Then the error must reference the implementation type
      And the error must describe missing constructor metadata
      And the error must not expose metadata keys
      And the error must not expose reflect-metadata APIs

    Scenario: Engine error wrapping
      Given the internal engine throws an error
      When the error crosses the adapter boundary
      Then the error must be wrapped in an IoC-specific error
      And the public error must not expose engine class names
      And the public error must not expose engine stack frames

  @must
  Rule: Public behavior is testable through the façade

    Scenario: Registration tests
      When testing registration
      Then tests must use ServiceCollection
      And tests may inspect ServiceDescriptor values
      And tests must not import the adapter
      And tests must not import the engine

    Scenario: Resolution tests
      When testing resolution
      Then tests must use ServiceProvider
      And tests must not access engine containers
      And tests must not access engine bindings

    Scenario: Diagnostics tests
      When testing diagnostics
      Then tests must use the diagnostics API
      And tests must not inspect adapter internals
      And tests must not inspect engine internals

    Scenario: Adapter contract tests
      When testing adapter integration
      Then tests may use the adapter interface
      And tests must verify that only IoC-specific errors cross the adapter boundary
      And tests must not expose adapter internals through the façade
```

## Specification notes

```md
## Architectural Invariant

The IoC façade is the only public API surface.

Application code must never depend on Inversify, reflect-metadata, engine decorators,
engine bindings, engine containers, metadata keys, or engine lifecycle concepts.

The adapter is the only boundary where façade concepts may be translated into engine concepts.
```

```md
## Interface Identity Note

TypeScript interfaces do not exist at runtime.

Interface-based registration may only be supported through a strongly typed runtime identity.
The identity may be symbol-backed, but it must behave like a runtime type in all public IoC APIs.

The identity must not be:

- a string token
- a raw Inversify token
- an arbitrary magic key
- an exposed engine binding concept
```

```md
## Metadata Note

Constructor injection may depend on emitted runtime metadata.

The application must not import reflect-metadata directly.
The application must not use Inversify decorators.

If required constructor metadata is unavailable at runtime, resolution must fail with a deterministic IoC error.
```
