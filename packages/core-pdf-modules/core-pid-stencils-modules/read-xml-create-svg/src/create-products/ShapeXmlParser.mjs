import path from "node:path";

export class ShapeXmlParser {
  #decoder;

  constructor(decoder) {
    this.#decoder = decoder;
  }

  parse(xml, sourceFile) {
    if (!xml || xml.trim().length === 0) {
      throw new Error(`XML content is empty for: ${sourceFile}`);
    }

    const categoryName =
      this.#readFirstAttribute(xml, /<shapes\b[^>]*>/iu, "name")
      ?? path.basename(sourceFile, ".xml");

    const normalizedCategory = this.#normalizeCategory(categoryName, sourceFile);
    const shapeTags = xml.match(/<shape\b[^>]*>/giu) ?? [];

    const products = shapeTags
      .map((tag) => this.#readAttribute(tag, "name"))
      .filter((name) => name !== undefined && name.trim().length > 0)
      .map((name) => this.#createProduct(normalizedCategory, name, sourceFile));

    return {
      category: normalizedCategory.category,
      type: normalizedCategory.type,
      sourceFile,
      products,
    };
  }

  #readFirstAttribute(xml, tagExpression, attributeName) {
    const match = xml.match(tagExpression);

    if (!match) {
      return undefined;
    }

    return this.#readAttribute(match[0], attributeName);
  }

  #readAttribute(tag, attributeName) {
    const expression = new RegExp(`\\b${attributeName}\\s*=\\s*["']([^"']+)["']`, "iu");
    const match = tag.match(expression);

    if (!match?.[1]) {
      return undefined;
    }

    return this.#decoder.decode(match[1]);
  }

  #normalizeCategory(rawCategoryName, sourceFile) {
    const fileName = path.basename(sourceFile, ".xml");
    const cleanCategory = rawCategoryName
      .replace(/^mxGraph\.pid\./iu, "")
      .replaceAll("_", " ")
      .replaceAll("-", " ")
      .trim();

    const category = this.#toTitleCase(cleanCategory.length > 0 ? cleanCategory : fileName);
    const type = this.#toKebabCase(fileName);

    return { category, type };
  }

  #createProduct(category, shapeName, sourceFile) {
    const name = shapeName.trim();
    const filenameBase = `${category.type}.${this.#toKebabCase(name)}`;

    return {
      type: category.type,
      name,
      productId: filenameBase,
      filenameBase,
      sourceFile,
    };
  }

  #toTitleCase(value) {
    return value
      .split(/\s+/u)
      .filter(Boolean)
      .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
      .join(" ");
  }

  #toKebabCase(value) {
    return value
      .replace(/([a-z0-9])([A-Z])/gu, "$1-$2")
      .replace(/[^a-zA-Z0-9]+/gu, "-")
      .replace(/^-+|-+$/gu, "")
      .replace(/-+/gu, "-")
      .toLowerCase();
  }
}