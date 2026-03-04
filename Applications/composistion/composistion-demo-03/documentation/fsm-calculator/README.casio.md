Transition table that matches your PUML exactly (last version you showed, with the intended fixes applied: `0.9` → `0..9`, remove duplicate `OperatorEntered` line, keep explicit error from `EnteringNumber` for `Operator` and `Equals` if buffer is empty):

### Transition table

| From            | Event    | Guard/Meta  | To               |
| --------------- | -------- | ----------- | ---------------- |
| `[*]`           | initial  | —           | `EnteringNumber` |
| EnteringNumber  | Digit    | `[0..9]`    | EnteringNumber   |
| EnteringNumber  | Operator | `[+ - * /]` | OperatorPressed  |
| EnteringNumber  | Equals   | `[=]`       | EnteringNumber   |
| EnteringNumber  | Clear    | `[CE]`      | EnteringNumber   |
| OperatorPressed | Digit    | `[0..9]`    | EnteringNumber   |
| OperatorPressed | Operator | —           | Error            |
| OperatorPressed | Equals   | `[=]`       | Error            |
| OperatorPressed | Clear    | `[CE]`      | EnteringNumber   |
| Error           | Clear    | —           | EnteringNumber   |

If you **also** want the “missing” `EnteringNumber -> Error` rows (as you requested earlier) explicitly in the table, you need guards (because otherwise it conflicts with valid Operator/Equals behavior). That table becomes:

| From           | Event    | Guard              | To              |
| -------------- | -------- | ------------------ | --------------- |
| EnteringNumber | Operator | `[bufferEmpty]`    | Error           |
| EnteringNumber | Operator | `[bufferNotEmpty]` | OperatorPressed |
| EnteringNumber | Equals   | `[noAnyNumber]`    | Error           |
| EnteringNumber | Equals   | `[hasAnyNumber]`   | EnteringNumber  |

guardless