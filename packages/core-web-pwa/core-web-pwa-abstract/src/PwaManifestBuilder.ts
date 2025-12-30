import { Builders } from "./builders.js";
import { Pwa } from "./code.js";
import { Types } from "./types.js";

//
// ────────────────────────────────────────────────
//   MANIFEST BUILDER
// ────────────────────────────────────────────────
//

export class PwaManifestBuilder implements Builders.IPwaManifestBuilder {
    private manifest: Types.PwaManifest = {};

    setName(name: string): this {
        this.manifest.name = name;
        return this;
    }

    setShortName(shortName: string): this {
        this.manifest.short_name = shortName;
        return this;
    }

    setDescription(description: string): this {
        this.manifest.description = description;
        return this;
    }

    setThemeColor(color: string): this {
        this.manifest.theme_color = color;
        return this;
    }

    setBackgroundColor(color: string): this {
        this.manifest.background_color = color;
        return this;
    }

    setDisplay(mode: Pwa.Enums.DisplayMode): this {
        this.manifest.display = mode;
        return this;
    }

    setStartUrl(url: string): this {
        this.manifest.start_url = url;
        return this;
    }

    addIcon(icon: Types.PwaIcon): this {
        if (!this.manifest.icons) this.manifest.icons = [];
        this.manifest.icons.push(icon);
        return this;
    }

    build(): Types.PwaManifest {
        return { ...this.manifest };
    }
}
