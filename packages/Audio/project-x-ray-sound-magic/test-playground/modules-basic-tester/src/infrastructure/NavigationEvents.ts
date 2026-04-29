export const NavigationEvents = {
  ViewChange: "view-change",
} as const;

export type NavigationEventName =
  (typeof NavigationEvents)[keyof typeof NavigationEvents];

export interface ViewChangeDetail {
  readonly view: string;
}

export type ViewChangeEvent = CustomEvent<ViewChangeDetail>;
