import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "node:path";
import { FileNameSanitizer, ImageExportMapper, KiwiImagePaths, IPdfImageExtractorLike, IExportPayload, IExportedImageFile, IExportedImageData, IPdfImageFragment } from "./kiwi-images-integration.test.js";

export class KiwiImageExportService {
  private readonly sanitizer: FileNameSanitizer;
  private readonly mapper: ImageExportMapper;
  private readonly paths: KiwiImagePaths;
  private readonly extractor: IPdfImageExtractorLike;

  public constructor(
    extractor: IPdfImageExtractorLike,
    paths: KiwiImagePaths,
    sanitizer: FileNameSanitizer,
    mapper: ImageExportMapper
  ) {
    this.extractor = extractor;
    this.paths = paths;
    this.sanitizer = sanitizer;
    this.mapper = mapper;
  }

  public async execute(): Promise<IExportPayload> {
    const binary = new Uint8Array(await readFile(this.paths.inputPath));
    const images = await this.extractor.extract(binary);

    await mkdir(this.paths.outputRootDir, { recursive: true });
    await mkdir(this.paths.outputImagesDir, { recursive: true });

    const imageFiles: IExportedImageFile[] = [];
    const imageData: IExportedImageData[] = [];

    for (let index = 0; index < images.length; index++) {
      const image = images[index]!;
      const bytes = this.requireBytes(image, index);
      const fileName = this.createFileName(image, index);
      const outputPath = join(this.paths.outputImagesDir, fileName);

      await writeFile(outputPath, bytes);

      imageFiles.push(this.mapper.toImageFile(image, fileName, bytes));
      imageData.push(this.mapper.toImageData(image, fileName));
    }

    const payload = this.mapper.toPayload("Kiwi.pdf", imageFiles, imageData);

    await writeFile(
      this.paths.outputJsonPath,
      JSON.stringify(payload, null, 2),
      "utf-8"
    );

    return payload;
  }

  private createFileName(image: IPdfImageFragment, index: number): string {
    const name = (image.name ?? "").trim().length > 0
      ? image.name!
      : `image-${index}`;

    const extension = this.extensionFromMimeType(image.mimeType);

    return `${this.sanitizer.sanitize(name)}.${extension}`;
  }

  private extensionFromMimeType(mimeType: string | undefined): string {
    if (mimeType === undefined) {
      return "bin";
    }
    const map: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/bmp": "bmp",
    };
    return map[mimeType] ?? "bin";
  }

  private requireBytes(image: IPdfImageFragment, index: number): Uint8Array {
    if (image.bytes instanceof Uint8Array && image.bytes.length > 0) {
      return image.bytes;
    }

    throw new Error(`Image at index ${index} does not contain bytes.`);
  }
}
