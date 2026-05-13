import { DefaultPianoRootConfiguration } from "./components/piano/PianoRootConfiguration";
import "./components/waterfall/piano-waterfall-column";
import "./components/waterfall/piano-waterfall-new";
import "./piano-app";

const column = document.querySelector("column-wc");

if (column instanceof HTMLElement) {
	const base = DefaultPianoRootConfiguration.waterfall.columns[0];

	if (base !== undefined) {
		(column as any).options = {
			...base,
			position: { x: 24, y: 24 },
			size: { x: 120, y: 240 },
			fill: "rgba(14, 165, 233, 0.95)",
			strokeColor: "rgba(255, 255, 255, 1)",
		};
	}
}

