<!-- spell-checker: disable -->

# NEW WAY 

We want to use tsyringe out of the box! We create meta data  that  please tsyringe. We maka a solution that Wraps the tsyringe with  a outer API, a decorator. tsyringe
The inner part is tsyringe the out is a API that avoids metadata, that is handle by the inner. We decorate API and Decorators.
The adapter is also a best practise filter, and give a flexibility to change technologi with too much work 
[tsyringe](https://github.com/microsoft/tsyringe)
### 1. Enable metadata support in `tsconfig.json`
<!-- spell-checker: enable -->

# @my-graphics/core-ioc — Custom IoC Container for TypeScript

A lightweight, modular dependency injection (DI) layer built on top of [tsyringe](https://github.com/microsoft/tsyringe) (a Microsoft package), designed to enforce SOLID, Open-Closed, and DRY principles.

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

---

## 🚀 Quick Start

### 1. Enable metadata support in `tsconfig.json`

```json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
