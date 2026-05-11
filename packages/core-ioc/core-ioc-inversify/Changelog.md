20.11.2025 - Added public C#-style API for registering dependencies (#45)

Benefits
- Improved readability and maintainability of registration code.
- Reduced boilerplate when registering dependencies.
- Enhanced type-safety through compile-time generics.
- Easier refactoring and IDE navigation.

Summary
- Added a C#-style surface that coexists with the existing API. The new API is a thin alias layer on top of the existing registration functions, so backward compatibility is preserved.

Public surface
- ioc.Add.AddSingleton<Interface, Implementation>(ImplementationCtor, [identifier?])
- ioc.Add.AddTransient<Interface, Implementation>(ImplementationCtor, [identifier?])
- ioc.Add.AddScoped<Interface, Implementation>(ImplementationCtor, [identifier?])

Notes
- Existing camelCase APIs remain available: addSingleton / addTransient / addScoped.
- The PascalCase methods delegate to the same underlying ContainerAdapter bindings and do not change runtime behavior.

Usage examples

```ts
// example: C#-style API (preferred for public consumers)
const ioc = new ServiceCollection();
ioc.Add.AddSingleton<IService, ServiceImpl>(ServiceImpl);
ioc.Add.AddTransient<IRepo, RepoImpl>(RepoImpl);
const container = ioc.build();
const svc = ioc.resolve<IService>(ServiceImpl);

// equivalently, legacy camelCase API (unchanged)
const ioc2 = new ServiceCollection();
ioc2.addSingleton(ServiceImpl, ServiceImpl);
ioc2.addTransient(RepoImpl, RepoImpl);
```

Spec
- Keep existing API for backward compatibility.
- New API must integrate with existing features (decorators, ContainerAdapter, lifetimes).
- Provide both direct PascalCase methods and an Add proxy for idiomatic C#-style call sites.
3D