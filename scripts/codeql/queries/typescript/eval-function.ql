/**
 * @name Use of eval or Function constructor
 * @description Finds calls to `eval()` and uses of the `Function` constructor which can execute dynamic code.
 * @kind problem
 * @severity WARNING
 */

import javascript

from CallExpr c, Expr callee
where
  callee = c.getCallee() and
  (
    // global eval()
    callee instanceof Identifier and callee.getName() = "eval"
    or
    // property access like window.eval
    callee instanceof PropertyAccess and callee.getPropertyName() = "eval"
  )
select c, "Call to eval() may execute untrusted code."

from NewExpr ne
where
  ne.getConstructor() instanceof Identifier and ne.getConstructor().getName() = "Function"
select ne, "Use of Function constructor may execute untrusted code."
