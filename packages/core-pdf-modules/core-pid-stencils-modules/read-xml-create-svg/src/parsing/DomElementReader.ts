export class DomElementReader {
  public getRequiredAttribute(element: Element, name: string): string {
    const value = element.getAttribute(name);

    if (value === null || value.length === 0) {
      throw new Error(
        `Required attribute '${name}' is missing on <${element.tagName}>.`
      );
    }

    return value;
  }

  public getOptionalAttribute(
    element: Element,
    name: string,
    fallback: string
  ): string {
    const value = element.getAttribute(name);
    return value === null || value.length === 0 ? fallback : value;
  }

  public getRequiredNumberAttribute(element: Element, name: string): number {
    const value = this.getRequiredAttribute(element, name);
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
      throw new Error(
        `Attribute '${name}' on <${element.tagName}> must be numeric. Value: '${value}'.`
      );
    }

    return numberValue;
  }

  public getOptionalNumberAttribute(
    element: Element,
    name: string,
    fallback: number
  ): number {
    const value = element.getAttribute(name);

    if (value === null || value.length === 0) {
      return fallback;
    }

    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
      throw new Error(
        `Attribute '${name}' on <${element.tagName}> must be numeric. Value: '${value}'.`
      );
    }

    return numberValue;
  }

  public children(element: Element): readonly Element[] {
    const result: Element[] = [];

    for (let index = 0; index < element.childNodes.length; index += 1) {
      const node = element.childNodes.item(index);

      if (node.nodeType === 1) {
        result.push(node as Element);
      }
    }

    return result;
  }

  public firstChildElementByName(
    element: Element,
    tagName: string
  ): Element | undefined {
    return this.children(element).find((child) => child.tagName === tagName);
  }
}