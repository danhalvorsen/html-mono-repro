import type { IStyleToken } from "./IStyleToken.js";

export const STYLE_TOKENS = {
  base: {
    name: "base",
    style: {
      stroke: {
        color: "transparent",
        width: 1,
        dash: [],
      },
      fill: {
        color: "transparent",
      },
      opacity: 1,
    },
  },

  grid: {
    name: "grid",
    extends: ["base"],
    style: {
      stroke: {
        color: "rgba(34, 40, 49, 0.22)",
        width: 1,
        dash: [4, 6],
      },
      opacity: 0.9,
    },
  },

  axis: {
    name: "axis",
    extends: ["base"],
    style: {
      stroke: {
        color: "#222831",
        width: 2.5,
      },
      opacity: 1,
    },
  },

  line: {
    name: "line",
    extends: ["base"],
    style: {
      stroke: {
        color: "#00ADB5",
        width: 2.75,
      },
      opacity: 0.98,
    },
  },

  surface: {
    name: "surface",
    extends: ["base"],
    style: {
      stroke: {
        color: "#393E46",
        width: 2.25,
      },
      fill: {
        color: "rgba(238, 238, 238, 0.22)",
      },
      opacity: 0.96,
    },
  },

  vertex: {
    name: "vertex",
    extends: ["base"],
    style: {
      stroke: {
        color: "#222831",
        width: 1.25,
      },
      fill: {
        color: "#00ADB5",
      },
      opacity: 1,
    },
  },

  "circle-primary": {
    name: "circle-primary",
    extends: ["surface"],
    style: {
      stroke: {
        color: "#00ADB5",
        width: 2.75,
      },
      fill: {
        color: "rgba(0, 173, 181, 0.2)",
      },
      opacity: 0.97,
    },
  },
} as const satisfies Record<string, IStyleToken>;
