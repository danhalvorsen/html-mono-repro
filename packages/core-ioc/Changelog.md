20.11.2025 - Make and new API that support c# syntax for registering dependencies (#45) Benefits: 
- Improved readability and maintainability of registration code.
- Reduced boilerplate code when registering dependencies.   
- Enhanced type safety with compile-time checks.
- Easier refactoring and code navigation with IDE support.  

Specifications: 
- The existing API have to be kept for backward compatibility
- New API should support registering dependencies using C# syntax 
- ioc.Add
    - AddSingleton<Interface, Implementation>();
    - AddTransient<Interface, Implementation>();
    - AddScoped<Interface, Implementation>();
- Ensure that the new API integrates seamlessly with existing features of the IoC container.  
```ts
