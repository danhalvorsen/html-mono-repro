import {
  ServiceCollection,
  type ServiceCollectionOptions,
} from "./ServiceCollection.js";

export function CreateContainerBuilder(options: ServiceCollectionOptions = {}) {
  return Object.freeze({
    Services: new ServiceCollection(options),
  });
}