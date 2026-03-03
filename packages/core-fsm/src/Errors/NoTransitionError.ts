
export class NoTransitionError extends Error {
  public constructor(args: { from: string; inputType: string; }) {
    super(`No transition found from state '${args.from}' on input '${args.inputType}'.`);
    this.name = "NoTransitionError";
  }
}
