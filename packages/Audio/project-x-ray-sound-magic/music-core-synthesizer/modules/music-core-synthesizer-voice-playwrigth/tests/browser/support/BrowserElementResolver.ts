export class BrowserElementResolver {
  public static getRequiredElement<TElement extends HTMLElement>(
    id: string,
  ): TElement {
    const element = document.getElementById(id);

    if (element === null) {
      throw new Error(`Expected element '${id}' to exist.`);
    }

    return element as TElement;
  }
}
