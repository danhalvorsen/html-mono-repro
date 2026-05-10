export const EndpointPath = {
  Command: "/api/command",
  Query: "/api/query",
} as const;

export type EndpointPath =
  typeof EndpointPath[keyof typeof EndpointPath];