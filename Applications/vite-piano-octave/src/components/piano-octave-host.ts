// Applications/vite-piano-octave/src/components/piano-octave-host.ts

import { LitElement } from "lit";
import { property } from "lit/decorators.js";
import SvgOctaveAdapter from "../adapters/SvgOctaveAdapter";
import { DEFAULT_OCTAVE_GEOMETRY } from "../octave/geometry/DefaultOctaveGeometry";
import type { Polygon2D } from "../octave/geometry/Polygon2D";
import type { PlacedPolygon } from "../octave/PlacedPolygon";

type RawPolygon2D = {
  name: string;
  points: number[][];
};

export class PianoOctaveHost extends LitElement {

  @property({ type: Number })
  gap = 4; // kept, but unused for now

  private readonly adapter = new SvgOctaveAdapter();

  private computeLayout(): PlacedPolygon[] {

    const place = (key: RawPolygon2D): PlacedPolygon => {
      const isBlack = key.name.includes("s");

      return {
        geometry: key as unknown as Polygon2D, // explicit trust boundary
        isBlack
      };
    };

    // Whites first, blacks last → correct z-order
    return [
      ...DEFAULT_OCTAVE_GEOMETRY.whiteKeys.map(place),
      ...DEFAULT_OCTAVE_GEOMETRY.blackKeys.map(place)
    ];
  }

  render() {
    return this.adapter.adapt(this.computeLayout());
  }
}

customElements.define("piano-octave-host", PianoOctaveHost);
