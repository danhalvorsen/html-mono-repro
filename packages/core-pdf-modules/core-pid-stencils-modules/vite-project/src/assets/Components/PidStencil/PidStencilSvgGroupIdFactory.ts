import type {
  PidStencilSvgManifestItem,
  PidStencilSvgViewModel,
} from "./PidStencilSvgViewModel.js";

export interface IPidStencilSvgGroupIdFactory {
  create(item: PidStencilSvgManifestItem): string;
}

export class PidStencilSvgGroupIdFactory implements IPidStencilSvgGroupIdFactory {
  public create(item: PidStencilSvgManifestItem): string {
    const explicitGroupId = item.groupId ?? item.category;

    if (explicitGroupId !== undefined && explicitGroupId.trim().length > 0) {
      return explicitGroupId.trim();
    }

    return this.createFromFileName(item.fileName);
  }

  private createFromFileName(fileName: string): string {
    const withoutExtension = fileName.replace(/\.svg$/iu, "");
    const dotIndex = withoutExtension.indexOf(".");
    const dashIndex = withoutExtension.indexOf("-");

    if (dotIndex > 0) {
      return withoutExtension.slice(0, dotIndex);
    }

    if (dashIndex > 0) {
      return withoutExtension.slice(0, dashIndex);
    }

    return "unknown";
  }
}

export class PidStencilSvgViewModelFactory {
  private readonly groupIdFactory: IPidStencilSvgGroupIdFactory;

  public constructor(groupIdFactory: IPidStencilSvgGroupIdFactory) {
    this.groupIdFactory = groupIdFactory;
  }

  public create(item: PidStencilSvgManifestItem): PidStencilSvgViewModel {
    const groupId = this.groupIdFactory.create(item);

    return {
      id: item.id,
      groupId,
      category: item.category ?? groupId,
      label: item.label,
      fileName: item.fileName,
      url: item.url,
    };
  }
}