<!-- spell-checker: disable -->3D

# NEW WAY 

# @my-graphics/core-ioc — Custom IoC Container for TypeScript

> ##### We failed combinding styringe with our own api own design 
>
 > A lightweight, modular dependency injection (DI) layer built on top of[tsyringe](https://github.com/microsoft/tsyringe) (a Microsoft package), designed to enforce SOLID, Open-Closed, and DRY principles.

And know its time for Inversify 

Inspired by C#'s service registration model (`AddSingleton`, `AddTransient`), this package exposes:

- A clean `IServiceCollection` interface
- Decorators like `@Injectable` and `@InjectWrapper`
- Lifecycle support: singleton, transient, and scoped

---

## ✨ Features

- ✅ Simple decorator-based syntax
- ✅ Based on `tsyringe`, but fully abstracted
- ✅ Full lifecycle control (singleton, transient, request)
- ✅ Works with `reflect-metadata`
- ✅ Ideal for monorepos and modular systems
3D
---

## Syntax taken from C#  ServiceCollection

```
builder.Services.AddTransient<IMyService, MyService>();
services.AddScoped<TInterface, TImplementation>();
```
## What
To register a service with a scoped lifetime in .NET's dependency injection container, where the service implements a specific interface, you use the AddScoped extension method on IServiceCollection.
builder.Services.AddTransient<IMyService, MyService>();

To register a service with a scoped lifetime in .NET's dependency injection container, where the service implements a specific interface, you use the AddScoped extension method on IServiceCollection.
services.AddScoped<TInterface, TImplementation>();

###  Scoped Lifetime  
- AddScoped: This method registers a service as Transient. A new instance of a Transient service is created every time it is requested.
- AddSingleton: O: This method registers a service as Scoped. A new instance of a Scoped service is created for each request. For example, in a web application, a new instance is created for each HTTP request, but the same instance is reused for all operations within that specific request. Eg: IEventWriter, or repository registration.
Choosing the correct lifetime is crucial for managing resources, en
## 🚀 Quick Start

### 1. Enable metadata support in `tsconfig.json`

```json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": teachrue
}
3D