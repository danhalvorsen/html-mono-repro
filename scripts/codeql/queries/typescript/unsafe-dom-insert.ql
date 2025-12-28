/**
 * @name Unsafe DOM insertion via insertAdjacentHTML / outerHTML
 * @description Finds uses of `insertAdjacentHTML` and assignments to `outerHTML` which can insert HTML into the DOM.
 * @kind problem
 * @severity WARNING
 */

import javascript

from CallExpr c
where
  c.getCallee() instanceof PropertyAccess and
  (c.getCallee().getPropertyName() = "insertAdjacentHTML")
select c, "Call to insertAdjacentHTML may insert untrusted HTML."

from AssignExpr a, PropertyAccess pa
where
  pa = a.getLeft() and pa.getPropertyName() = "outerHTML"
select a, "Assignment to outerHTML may insert untrusted HTML."
