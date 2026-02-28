// src/main.ts (usage)

import { SvgScene } from "./SvgScene";
import { SvgRect } from "./svgShape";

const svg = document.querySelector("svg#stage") as SVGSVGElement;
const scene = new SvgScene({ autoUpdate: true });
scene.mount(svg);

const rect = new SvgRect("rect-1", { x: 20, y: 20, w: 120, h: 60, rx: 8, className: "card" });
scene.add(rect);

// Later:
rect.set({ x: 40, y: 30, w: 160 });