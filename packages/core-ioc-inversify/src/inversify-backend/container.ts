
import "reflect-metadata";
import { Container } from "inversify";

export function createInversifyContainer(options?: { autoBindInjectable?: boolean }) {
  return new Container({
    autoBindInjectable: options?.autoBindInjectable ?? false,
  });
}
