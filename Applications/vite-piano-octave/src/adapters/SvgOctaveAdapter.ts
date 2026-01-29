// Applications/vite-piano-octave/src/adapters/SvgOctaveAdapter.ts

import { svg } from "lit";
import type { PlacedPolygon } from "../octave/PlacedPolygon";

const GEOMETRY_HEIGHT_PERCENT = 100;
const SPACE_PERCENT = 1; // 👈 THIS IS THE CONTROL

export default class SvgOctaveAdapter {

  adapt(polygons: PlacedPolygon[]) {
    return svg`
      <svg
        viewBox="0 0 169 ${GEOMETRY_HEIGHT_PERCENT}"
        xmlns="http://www.w3.org/2000/svg"
      >
        ${polygons.map(p => this.renderPolygon(p))}
      </svg>
    `;
  }

  private renderPolygon(p: PlacedPolygon) {
    const points = p.geometry.points
      .map(([x, y]) => `${x},${GEOMETRY_HEIGHT_PERCENT - y}`)
      .join(" ");

    // polygon width
    const xs = p.geometry.points.map(pt => pt[0]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const width = maxX - minX;

    // 5% space
    const spaceX = width * (SPACE_PERCENT / 100);

    // SVG matrix: translate X only (space)
    const matrix = `matrix(1,0,0,1,${spaceX / 2},0)`;

    return svg`
      <g transform="${matrix}">
        <polygon
          points="${points}"
          fill="${p.isBlack ? "#000" : "#fff"}"
          stroke="#000"
        />
      </g>
    `;
  }
}
