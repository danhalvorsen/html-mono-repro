export interface EditorReadableTarget {
  readonly getValue?: () => string;
  readonly code?: string;
  readonly value?: string;
}

export interface EditorWritableTarget {
  readonly setValue?: (value: string) => void;
  code?: string;
  value?: string;
}

export const resolveEditorTarget = <TTarget>(
  host: HTMLElement,
  selector: string,
): TTarget | null => {
  if (!selector.trim()) {
    return null;
  }

  const root = host.getRootNode();
  const queryInRoot =
    root instanceof ShadowRoot || root instanceof Document
      ? (root.querySelector(selector) as TTarget | null)
      : null;

  if (queryInRoot) {
    return queryInRoot;
  }

  return document.querySelector(selector) as TTarget | null;
};

export const readCodeFromTarget = (target: EditorReadableTarget | null): string => {
  if (!target) {
    return "";
  }

  if (typeof target.getValue === "function") {
    return target.getValue();
  }

  if (typeof target.value === "string") {
    return target.value;
  }

  return target.code ?? "";
};

export const writeCodeToTarget = (target: EditorWritableTarget | null, content: string): boolean => {
  if (!target) {
    return false;
  }

  if (typeof target.setValue === "function") {
    target.setValue(content);
    return true;
  }

  if (typeof target.value === "string") {
    target.value = content;
    return true;
  }

  target.code = content;
  return true;
};

export const countCodeLines = (content: string): number => content.split("\n").length;
