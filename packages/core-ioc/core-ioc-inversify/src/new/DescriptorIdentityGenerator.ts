import { DescriptorIdentity } from "./DescriptorIdentity.js";
import type { ServiceLifetime } from "./ServiceLifetime.js";
import type { ServiceRegistrationKind } from "./ServiceRegistrationKind.js";

export type DescriptorIdentitySource = {
  readonly ServiceName: string;
  readonly ImplementationName: string;
  readonly Lifetime: ServiceLifetime;
  readonly RegistrationKind: ServiceRegistrationKind;
};

export interface IDescriptorIdentityGenerator {
  Generate(
    source: DescriptorIdentitySource,
    isReserved: (candidate: string) => boolean,
  ): DescriptorIdentity;
}

export class XorDescriptorIdentityGenerator implements IDescriptorIdentityGenerator {
  public Generate(
    source: DescriptorIdentitySource,
    isReserved: (candidate: string) => boolean,
  ): DescriptorIdentity {
    for (let collisionIndex = 0; collisionIndex < Number.MAX_SAFE_INTEGER; collisionIndex++) {
      const stableSource = this.createStableSource(source, collisionIndex);
      const candidate = `ioc_${this.xorHash(stableSource)}`;

      if (!isReserved(candidate)) {
        return new DescriptorIdentity(candidate, collisionIndex, stableSource);
      }
    }

    throw new Error("Unable to generate a unique descriptor identity.");
  }

  private createStableSource(
    source: DescriptorIdentitySource,
    collisionIndex: number,
  ): string {
    return [
      source.ServiceName,
      source.ImplementationName,
      source.Lifetime,
      source.RegistrationKind,
      collisionIndex.toString(),
    ].join("|");
  }

  private xorHash(value: string): string {
    let hash = 0x811c9dc5;

    for (let index = 0; index < value.length; index++) {
      hash = hash ^ value.charCodeAt(index);
      hash = ((hash << 5) | (hash >>> 27)) >>> 0;
    }

    return hash.toString(16).padStart(8, "0");
  }
}