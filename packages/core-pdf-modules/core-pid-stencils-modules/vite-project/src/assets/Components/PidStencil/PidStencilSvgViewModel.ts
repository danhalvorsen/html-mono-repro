export interface PidStencilSvgViewModel {
  readonly id: string;
  readonly groupId: string;
  readonly category: string;
  readonly label: string;
  readonly fileName: string;
  readonly url: string;
}

export interface PidStencilSvgManifestItem {
  readonly id: string;
  readonly groupId?: string;
  readonly category?: string;
  readonly label: string;
  readonly fileName: string;
  readonly url: string;
}

export interface PidStencilSvgManifest {
  readonly schemaVersion: number;
  readonly count: number;
  readonly items: readonly PidStencilSvgManifestItem[];
}