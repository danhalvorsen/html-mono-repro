import { ServiceCollection } from "./ServiceCollection.js";
import { InversifyContainerAdapter } from "./inversify/InversifyContainerAdapter.js";

export function CreateDefaultContainerBuilder() {
  return Object.freeze({
    Services: new ServiceCollection({
      Adapter: new InversifyContainerAdapter(),
    }),
  });
}