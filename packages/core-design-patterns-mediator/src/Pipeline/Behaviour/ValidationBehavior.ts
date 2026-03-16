import { type Result, Err, Ok } from "@monorepo/core-design-patterns";
import { IContextPipeline } from "../Context/IContextPipeline.js";
import { IMessage } from "../Messages/IMessage.js";
import { IBehavior } from "./IBehavior.js";
import { ValidationOk, ValidationErr } from "./results.js";

export class ValidationBehavior<T extends IMessage>
  implements IBehavior<T, ValidationOk, ValidationErr> {
  public async execute(
    _ctx: IContextPipeline,
    msg: T,
  ): Promise<Result<ValidationOk, ValidationErr>> {
    if (!msg.name) {
      return Err<ValidationOk, ValidationErr>(
        new ValidationErr("Missing name"),
      );
    }

    return Ok<ValidationOk, ValidationErr>(new ValidationOk());
  }
}
