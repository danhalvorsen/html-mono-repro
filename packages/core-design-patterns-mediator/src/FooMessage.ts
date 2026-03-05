 
/* ============================================================================
 * Sample Usage
 * ============================================================================ */

import { IMessage } from "./Pipeline/Messages/IMessage.js";

export class FooMessage implements IMessage {
  public readonly name = "FooMessage";
}
