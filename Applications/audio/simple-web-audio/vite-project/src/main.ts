// src/main.ts

import "./AudioPlayerElement";
import "./index.css";
import {
    SliderElement,
    SliderEventName,
    type SliderChangedEvent,
} from "./UI/Slider/SliderElement";

const slider = document.querySelector<SliderElement>("range-slider");
type AudioPlayerControl = HTMLElement & {
  setFrequencyHz(value: number): void;
};
const player = document.querySelector<AudioPlayerControl>("audio-player");

if (slider !== null) {
  slider.addEventListener(SliderEventName.Changed, (event: Event) => {
    const sliderEvent = event as SliderChangedEvent;

    if (sliderEvent.detail.id === "voice.frequency") {
      player?.setFrequencyHz(sliderEvent.detail.value);
    }

    console.log(sliderEvent.detail.id, sliderEvent.detail.value);
  });
}