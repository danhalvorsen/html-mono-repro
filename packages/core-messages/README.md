@monorepo/core-messages

Shared runtime message helpers used by validators and tooling in the monorepo.

Usage:

```js
const { Messages } = require('@monorepo/core-messages');
console.log(Messages.missingField('compilerOptions.target'));
```

Keep messages short, actionable and suitable for machine and human consumption.
