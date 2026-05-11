import { ServiceCollection } from "../ServiceCollection.js";
import { InversifyContainerAdapter } from "./InversifyContainerAdapter.js";

export function CreateInversifyContainerBuilder() {
  return Object.freeze({
    Services: new ServiceCollection({
      Adapter: new InversifyContainerAdapter(),
    }),
  });
}