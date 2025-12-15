# SPEC-1: Custom IoC Container

## Background

In software development, managing dependencies efficiently is critical to ensuring modularity, testability, and maintainability. Dependency Injection (DI) is a common pattern used to achieve this, and many existing frameworks provide IoC (Inversion of Control) containers to facilitate dependency resolution. However, this project aims to create a custom abstraction for DI using an open-source library while maintaining control over decorators, syntax, and structure.

The goal is to develop a container with a syntax inspired by C#'s service collection and ensure compliance with SOLID, Open-Closed, and DRY principles. This container should be intuitive, scalable, and easy to extend while enforcing strong design patterns.

## Requirements

### Must-Have

* Utilize an existing open-source DI library as the foundation.
* Provide a registration mechanism similar to C# service collection (e.g., `add_singleton`, `add_transient`).
* Implement dependency resolution with a custom IoC container.
* Allow dependency registration via custom-defined decorators.
* Ensure adherence to SOLID principles, particularly Open-Closed and DRY.
* Support singleton, transient, and scoped lifecycle management.

### Should-Have

* Support constructor and method injection.
* Allow easy integration with existing Python applications.
* Provide a simple, intuitive API for registering and resolving dependencies.

### Could-Have

* Support optional lazy-loading or deferred initialization.
* Provide debugging tools or introspection capabilities to track registered dependencies.

### Won't-Have

* Custom-built DI resolution engine from scratch (leveraging an existing library is required).
* Overcomplicated meta-programming or runtime modifications beyond decorators and registration mechanisms.
3D