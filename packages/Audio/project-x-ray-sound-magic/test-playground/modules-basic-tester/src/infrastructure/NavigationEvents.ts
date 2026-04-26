// src/infrastructure/NavigationEvents.ts

export const NavigationEvents = {
  ViewChange: "view-change",
} as const;

export interface ViewChangeDetail {
  readonly view: string;
}