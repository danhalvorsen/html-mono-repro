// Wrapper to normalize various module export styles from ./LineSegment
import * as _LS from "./LineSegment.js";

const resolved: any = ((_LS as any).LineSegment ?? ( _LS as any).default ?? _LS);

// Export a typed alias for consumers
export const LineSegment: any = resolved;
export default LineSegment;
