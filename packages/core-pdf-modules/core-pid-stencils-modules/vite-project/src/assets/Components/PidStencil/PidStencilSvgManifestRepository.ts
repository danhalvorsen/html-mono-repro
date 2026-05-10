import type {
  PidStencilSvgManifest,
  PidStencilSvgViewModel,
} from "./PidStencilSvgViewModel.js";
import {
  PidStencilSvgGroupIdFactory,
  PidStencilSvgViewModelFactory,
} from "./PidStencilSvgGroupIdFactory.js";

export interface IPidStencilSvgManifestRepository {
  load(): Promise<readonly PidStencilSvgViewModel[]>;
}

export class FetchPidStencilSvgManifestRepository
  implements IPidStencilSvgManifestRepository
{
  private readonly manifestUrl: string;
  private readonly viewModelFactory: PidStencilSvgViewModelFactory;

  public constructor(manifestUrl = "/pid-stencils/manifest.json") {
    this.manifestUrl = manifestUrl;
    this.viewModelFactory = new PidStencilSvgViewModelFactory(
      new PidStencilSvgGroupIdFactory(),
    );
  }

  public async load(): Promise<readonly PidStencilSvgViewModel[]> {
    const response = await fetch(this.manifestUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to load SVG manifest. Status: ${response.status} ${response.statusText}`,
      );
    }

    const manifest = (await response.json()) as PidStencilSvgManifest;

    if (!Array.isArray(manifest.items)) {
      throw new Error("Invalid SVG manifest. Expected 'items' array.");
    }

    return manifest.items.map((item) => this.viewModelFactory.create(item));
  }
}