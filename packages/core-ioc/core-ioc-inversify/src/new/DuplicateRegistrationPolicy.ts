export const DuplicateRegistrationPolicy = {
  Allow: "Allow",
  RejectExactDuplicates: "RejectExactDuplicates",
} as const;

export type DuplicateRegistrationPolicy =
  (typeof DuplicateRegistrationPolicy)[keyof typeof DuplicateRegistrationPolicy];