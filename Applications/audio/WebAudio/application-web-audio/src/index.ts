// Applications/audio/WebAudio/application-web-audio/src/index.ts

import "./lit3/WebComponents/MrCanvas.js";
import "./lit3/WebComponents/MrDraggable.js";
import "./lit3/WebComponents/MrRect.js";

import { createSynthFactory, type ISynthesizer } from "./Audio/MakeIt.js";

const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");

if (!(startButton instanceof HTMLButtonElement)) {
  throw new Error('Element with id="start" was not found or is not a button.');
}

if (!(stopButton instanceof HTMLButtonElement)) {
  throw new Error('Element with id="stop" was not found or is not a button.');
}

let context: AudioContext | null = null;
let synth: ISynthesizer | null = null;

function getOrCreateContext(): AudioContext {
  if (context !== null) {
    return context;
  }

  context = new AudioContext();
  return context;
}

function createAndStartSynth(): void {
  const audioContext = getOrCreateContext();

  if (synth !== null) {
    return;
  }

  const factory = createSynthFactory(audioContext);

  synth = factory.createLead();
  synth.connect(audioContext.destination);
  synth.start();
}

async function startAsync(): Promise<void> {
  const audioContext = getOrCreateContext();

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  createAndStartSynth();
}

function stopAndDisposeSynth(): void {
  if (synth === null) {
    return;
  }

  try {
    synth.stop();
  } finally {
    synth.dispose();
    synth = null;
  }
}

startButton.addEventListener("click", () => {
  void startAsync();
});

stopButton.addEventListener("click", () => {
  stopAndDisposeSynth();
});

window.addEventListener("beforeunload", () => {
  stopAndDisposeSynth();

  if (context !== null && context.state !== "closed") {
    void context.close();
  }
});