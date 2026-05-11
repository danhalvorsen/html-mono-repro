import type { interfaces } from "inversify";
import {
  IsServiceIdentity,
  type ServiceKey,
} from "../ServiceTypes.js";

export function ToInversifyServiceIdentifier<TService extends object>(
  serviceType: ServiceKey<TService>,
): interfaces.ServiceIdentifier<TService> {
  if (IsServiceIdentity(serviceType)) {
    return serviceType.Symbol as unknown as interfaces.ServiceIdentifier<TService>;
  }

  return serviceType as unknown as interfaces.ServiceIdentifier<TService>;
}