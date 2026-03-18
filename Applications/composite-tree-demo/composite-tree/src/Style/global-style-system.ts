export interface IGlobalStyleConfig {
  readonly root?: Readonly<Record<string, string>>
  readonly html?: Readonly<Record<string, string>>
  readonly body?: Readonly<Record<string, string>>
}

export interface IGlobalStyleReference {
  readonly token?: string
  readonly overrides?: Readonly<IGlobalStyleConfig>
}

export interface IGlobalStyleToken {
  readonly name: string
  readonly extends?: readonly string[]
  readonly config: Readonly<IGlobalStyleConfig>
}

const mergeSection = (
  base?: Readonly<Record<string, string>>,
  override?: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> | undefined => {
  const merged = {
    ...(base ?? {}),
    ...(override ?? {}),
  }

  return Object.keys(merged).length > 0 ? merged : undefined
}

const mergeConfig = (
  base?: Readonly<IGlobalStyleConfig>,
  override?: Readonly<IGlobalStyleConfig>,
): IGlobalStyleConfig => ({
  ...(mergeSection(base?.root, override?.root) !== undefined
    ? { root: mergeSection(base?.root, override?.root) }
    : {}),
  ...(mergeSection(base?.html, override?.html) !== undefined
    ? { html: mergeSection(base?.html, override?.html) }
    : {}),
  ...(mergeSection(base?.body, override?.body) !== undefined
    ? { body: mergeSection(base?.body, override?.body) }
    : {}),
})

export class GlobalStyleResolver {
  public constructor(
    private readonly tokens: Readonly<Record<string, IGlobalStyleToken>>,
  ) {}

  public resolve(reference?: Readonly<IGlobalStyleReference>): IGlobalStyleConfig {
    const tokenConfig =
      reference?.token !== undefined
        ? this.resolveToken(reference.token, new Set<string>())
        : {}

    return mergeConfig(tokenConfig, reference?.overrides)
  }

  private resolveToken(name: string, visited: Set<string>): IGlobalStyleConfig {
    if (visited.has(name)) {
      throw new Error(`Circular global style token inheritance detected for '${name}'.`)
    }

    const token = this.tokens[name]

    if (token === undefined) {
      throw new Error(`Unknown global style token '${name}'.`)
    }

    visited.add(name)

    let result: IGlobalStyleConfig = {}

    for (const parentName of token.extends ?? []) {
      result = mergeConfig(result, this.resolveToken(parentName, visited))
    }

    visited.delete(name)

    return mergeConfig(result, token.config)
  }
}

const applySection = (
  target: HTMLElement,
  styles?: Readonly<Record<string, string>>,
): void => {
  if (styles === undefined) {
    return
  }

  for (const [property, value] of Object.entries(styles)) {
    target.style.setProperty(property, value)
  }
}

export const applyGlobalStyleConfig = (config: Readonly<IGlobalStyleConfig>): void => {
  applySection(document.documentElement, config.root)
  applySection(document.documentElement, config.html)
  applySection(document.body, config.body)
}
