import { vi } from "vitest";

export const cleanupDom = (): void => {
  document.body.innerHTML = "";
};

export const waitForAsyncTasks = async (): Promise<void> => {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
};

export const createTextFile = (
  fileName: string,
  content: string,
  relativePath?: string,
): File => {
  const file = new File([content], fileName, { type: "text/plain" });

  if (relativePath) {
    Object.defineProperty(file, "webkitRelativePath", {
      value: relativePath,
      configurable: true,
    });
  }

  return file;
};

export const createFileList = (files: readonly File[]): FileList => {
  const fileListLike: {
    [index: number]: File;
    length: number;
    item(index: number): File | null;
  } = {
    length: files.length,
    item(index: number): File | null {
      return files[index] ?? null;
    },
  };

  files.forEach((file, index) => {
    fileListLike[index] = file;
  });

  return fileListLike as unknown as FileList;
};

export const assignInputFiles = (
  input: HTMLInputElement,
  files: readonly File[],
): void => {
  Object.defineProperty(input, "files", {
    value: createFileList(files),
    configurable: true,
  });
};

export const createWritableTarget = (id = "editor-target") => {
  const target = document.createElement("div") as HTMLDivElement & {
    setValue: (value: string) => void;
  };

  target.id = id;
  target.setValue = vi.fn();
  document.body.append(target);

  return target;
};

export const createReadableTarget = (
  value: string,
  id = "editor-target",
): HTMLDivElement & { getValue: () => string } => {
  const target = document.createElement("div") as HTMLDivElement & {
    getValue: () => string;
  };

  target.id = id;
  target.getValue = () => value;
  document.body.append(target);

  return target;
};
