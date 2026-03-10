import { ITemplateResolver } from "./ITemplateResolver.js";
import { Directory, File } from "@monorepo/core-filesystem";

export class HandlebarTemplateResolver implements ITemplateResolver {
  constructor(private readonly root: Directory) {}

  resolve(name: string) {
    const f = new File(this.root.path.join(name + ".hbs"));
    return f.read();
  }
}
