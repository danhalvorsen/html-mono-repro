import type { IStyleToken } from "@monorepo/core-style-system";

/**
 * Typed token names to eliminate magic strings.
 */
export const SequencerUiTokenKeys = {
  SURFACE: "surface",
  AXIS: "axis",
  LINE: "line",
  DIGIT_BUTTON_FRAME_ON: "digit-button-frame-on",
  DIGIT_BUTTON_FRAME_OFF: "digit-button-frame-off",
  DIGIT_BUTTON_INNER_FRAME_ON: "digit-button-inner-frame-on",
  DIGIT_BUTTON_INNER_FRAME_OFF: "digit-button-inner-frame-off",
  DIGIT_BUTTON_ACCENT_ON: "digit-button-accent-on",
  DIGIT_BUTTON_ACCENT_OFF: "digit-button-accent-off",
  DIGIT_BUTTON_SHELL: "digit-button-shell",
  DIGIT_BUTTON_FACE: "digit-button-face",
  DIGIT_BUTTON_TEXT: "digit-button-text",
  DIGIT_BUTTON_TEXT_OFF: "digit-button-text-off",
  RGB_BUTTON_SHELL: "rgb-button-shell",
  RGB_BUTTON_OFF: "rgb-button-off",
  KNOB_BUTTON_RING: "knob-button-ring",
  KNOB_BUTTON_RING_OFF: "knob-button-ring-off",
  KNOB_BUTTON_BODY_ON: "knob-button-body-on",
  KNOB_BUTTON_BODY_OFF: "knob-button-body-off",
  KNOB_BUTTON_INDICATOR: "knob-button-indicator",
  KNOB_BUTTON_INDICATOR_OFF: "knob-button-indicator-off",
  TONE_LABEL_BACKGROUND: "tone-label-background",
  TONE_LABEL_TEXT: "tone-label-text",
  TONE_LABEL_BORDER: "tone-label-border",
  TRANSPORT_BUTTON_SHELL: "transport-button-shell",
  TRANSPORT_BUTTON_ICON: "transport-button-icon",
  TRANSPORT_BUTTON_LABEL: "transport-button-label",
  SHIFT_BUTTON_FACE: "shift-button-face",
  SHIFT_BUTTON_TEXT: "shift-button-text",
} as const;

export const UI_TOKENS = {
  "button-base": {
    name: "button-base",
    style: {
      stroke: {
        color: "#084cc0",
        width: 1.5,
      },
      fill: {
        color: "#0b6cff",
      },
      opacity: 1,
    },
  },

  "digit-button-frame-on": {
    name: "digit-button-frame-on",
    style: {
      stroke: {
        color: "#ecf4ff",
        width: 2.6,
      },
      fill: {
        color: "#202734",
      },
      opacity: 1,
    },
  },

  "digit-button-frame-off": {
    name: "digit-button-frame-off",
    style: {
      stroke: {
        color: "#7a8499",
        width: 2.6,
      },
      fill: {
        color: "#181e28",
      },
      opacity: 1,
    },
  },

  "digit-button-inner-frame-on": {
    name: "digit-button-inner-frame-on",
    style: {
      stroke: {
        color: "#9edcff",
        width: 1.8,
      },
      opacity: 1,
    },
  },

  "digit-button-inner-frame-off": {
    name: "digit-button-inner-frame-off",
    style: {
      stroke: {
        color: "#556179",
        width: 1.8,
      },
      opacity: 1,
    },
  },

  "digit-button-accent-on": {
    name: "digit-button-accent-on",
    style: {
      fill: {
        color: "#19d8ff",
      },
      opacity: 1,
    },
  },

  "digit-button-accent-off": {
    name: "digit-button-accent-off",
    style: {
      fill: {
        color: "#4d6778",
      },
      opacity: 1,
    },
  },

  "digit-button-shell": {
    name: "digit-button-shell",
    style: {
      fill: {
        color: "#252c37",
      },
      opacity: 1,
    },
  },

  "digit-button-face": {
    name: "digit-button-face",
    style: {
      fill: {
        color: "#1a202b",
      },
      opacity: 1,
    },
  },

  "digit-button-text": {
    name: "digit-button-text",
    style: {
      fill: {
        color: "#f5fbff",
      },
      opacity: 1,
    },
  },

  "digit-button-text-off": {
    name: "digit-button-text-off",
    style: {
      fill: {
        color: "#8b95a8",
      },
      opacity: 1,
    },
  },

  "rgb-button-shell": {
    name: "rgb-button-shell",
    style: {
      fill: {
        color: "#161c24",
      },
      opacity: 1,
    },
  },

  "rgb-button-off": {
    name: "rgb-button-off",
    style: {
      opacity: 0.35,
    },
  },

  "knob-button-ring": {
    name: "knob-button-ring",
    style: {
      stroke: {
        color: "#3d4657",
      },
      opacity: 1,
    },
  },

  "knob-button-ring-off": {
    name: "knob-button-ring-off",
    style: {
      stroke: {
        color: "#283042",
      },
      opacity: 1,
    },
  },

  "knob-button-body-on": {
    name: "knob-button-body-on",
    style: {
      fill: {
        color: "#03060d",
      },
      opacity: 1,
    },
  },

  "knob-button-body-off": {
    name: "knob-button-body-off",
    style: {
      fill: {
        color: "#101621",
      },
      opacity: 1,
    },
  },

  "knob-button-indicator": {
    name: "knob-button-indicator",
    style: {
      stroke: {
        color: "#f0f5ff",
      },
      opacity: 1,
    },
  },

  "knob-button-indicator-off": {
    name: "knob-button-indicator-off",
    style: {
      stroke: {
        color: "#f0f5ff",
      },
      opacity: 0.48,
    },
  },

  "tone-label-background": {
    name: "tone-label-background",
    style: {
      fill: {
        color: "#12161f",
      },
      opacity: 1,
    },
  },

  "tone-label-text": {
    name: "tone-label-text",
    style: {
      fill: {
        color: "#f1efe6",
      },
      opacity: 1,
    },
  },

  "tone-label-border": {
    name: "tone-label-border",
    style: {
      stroke: {
        color: "#d8d3c4",
        width: 0,
      },
      opacity: 1,
    },
  },

  "transport-button-shell": {
    name: "transport-button-shell",
    style: {
      fill: {
        color: "#e2e6ee",
      },
      stroke: {
        color: "#8892a8",
        width: 1.5,
      },
      opacity: 1,
    },
  },

  "transport-button-icon": {
    name: "transport-button-icon",
    style: {
      fill: {
        color: "#1c2234",
      },
      stroke: {
        color: "#1c2234",
        width: 2,
      },
      opacity: 1,
    },
  },

  "transport-button-label": {
    name: "transport-button-label",
    style: {
      fill: {
        color: "#2a3248",
      },
      opacity: 1,
    },
  },

  "shift-button-face": {
    name: "shift-button-face",
    style: {
      fill: {
        color: "#00BCD4",
      },
      stroke: {
        color: "#0097A7",
        width: 1.5,
      },
      opacity: 1,
    },
  },

  "shift-button-text": {
    name: "shift-button-text",
    style: {
      fill: {
        color: "#f0f8ff",
      },
      opacity: 1,
    },
  },
} as const satisfies Record<string, IStyleToken>;

/**
 * @deprecated Use UI_TOKENS.
 */
export const SEQUENCER_UI_TOKENS = UI_TOKENS;
