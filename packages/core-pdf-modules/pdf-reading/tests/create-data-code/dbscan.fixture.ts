// packages/core-pdf-web-app-demo/pdf-reading/tests/create-data-code/dbscan.fixture.ts

import { join } from "node:path";

import {
  type IPdfTextFragment,
} from "@monorepo/core-pdf-reader";
import { DbscanPdfBoundingBoxClusterer } from "@monorepo/core-pdf-dbscan";

export interface IAppBoundingBox {
  readonly id: string;
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
  readonly width: number;
  readonly height: number;
}

export class DbScanFixture {
  public readonly outputDirectory: string;
  public readonly clusteringJsonPath: string;

  public readonly clusterer: DbscanPdfBoundingBoxClusterer;

  public constructor(currentWorkingDirectory: string) {
    this.outputDirectory = join(currentWorkingDirectory, "tests", "generated");
    this.clusteringJsonPath = join(this.outputDirectory, "Kiwi.dbscan.json");

    this.clusterer = new DbscanPdfBoundingBoxClusterer();
  }

  public toBoundingBox(
    fragment: IPdfTextFragment,
    index: number,
  ): IAppBoundingBox {
    const x = fragment.boundingBox.position.x;
    const y = fragment.boundingBox.position.y;
    const width = Math.max(fragment.boundingBox.width, 0);
    const height = Math.max(fragment.boundingBox.height, 0);

    return Object.freeze({
      id: `p${fragment.pageNumber}-${index}`,
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height,
      width,
      height,
    });
  }
}