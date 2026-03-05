import { type Result, Err, Ok } from "../functional/result/result.js";
import { IMessage, IBehavior, ValidationOk, ValidationErr } from "./code.js";
import { IContextPipeline } from "./IContextPipeline.js";

export class ValidationBehavior<T extends IMessage>
  implements IBehavior<T, ValidationOk, ValidationErr> {

  public async execute(
    _ctx: IContextPipeline,
    msg: T
  ): Promise<Result<ValidationOk, ValidationErr>> {
    if (!msg.name) return Err<ValidationOk, ValidationErr>({ behavior: "validation", reason: "Missing name" });
    return Ok<ValidationOk, ValidationErr>({ behavior: "validation" });
  }
}
