/**
 * @name Unsafe assignment to innerHTML
 * @description Finds assignments to `element.innerHTML` which can lead to XSS if the value is untrusted.
 * @kind problem
 * @severity WARNING
 */

import javascript

from AssignExpr a, PropertyAccess pa
where
  pa = a.getLeft() and
  pa.getPropertyName() = "innerHTML"
select a, "Assignment to innerHTML may allow injection of untrusted HTML."
