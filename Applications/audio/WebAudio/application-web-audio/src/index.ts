// src/index.ts

import {
  createSynthFactory,
  type ISynthesizer
} from "./web-audio-builder-factory";

let context: AudioContext | null = null;
let synth: ISynthesizer | null = null;

async function ensureContext(): Promise<AudioContext> {
  if (!context) {
    context = new AudioContext();
  }

  if (context.state === "suspended") {
    await context.resume();
  }

  return context;
}

async function startSynth(): Promise<void> {
  const ctx = await ensureContext();

  if (synth) {
    return;
  }

  const factory = createSynthFactory(ctx);

  synth = factory.createLead();
  synth.connect(ctx.destination);
  synth.start();
}

function stopSynth(): void {
  if (!synth) return;

  synth.stop();
  synth.dispose();
  synth = null;
}

function bindUI(): void {
  const startBtn = document.getElementById("start") as HTMLButtonElement;
  const stopBtn = document.getElementById("stop") as HTMLButtonElement;

  startBtn.addEventListener("click", () => {
    void startSynth();
  });

  stopBtn.addEventListener("click", () => {
    stopSynth();
  });
}

document.addEventListener("DOMContentLoaded", bindUI);