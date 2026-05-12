/**
 * Contract for validating whether a DOM element satisfies a target element type.
 */
export interface IElementTargetMatcher<TTarget extends Element> {
  matches(element: Element): element is TTarget;
}
