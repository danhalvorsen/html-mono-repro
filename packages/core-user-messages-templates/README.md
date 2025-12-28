@monorepo/core-user-messages-templates

Provides concrete runtime implementations of `ITemplate` and `IFormatter` for developer-facing messages.

Usage:

```js
const { UserTemplate, UserFormatter, Messages } = require('@monorepo/core-user-messages-templates/src');

const tpl = new UserTemplate('Missing ${field} in ${file}');
const fmt = new UserFormatter();
console.log(fmt.format({ field: 'compilerOptions.target', file: 'tsconfig.json' }, tpl));
```
