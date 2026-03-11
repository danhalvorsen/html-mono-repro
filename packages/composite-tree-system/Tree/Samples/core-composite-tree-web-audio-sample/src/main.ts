import { SampleRuntime } from "./SampleRuntime.js";

const runtime = new SampleRuntime();

const play = document.getElementById("play") as HTMLButtonElement;
const stop = document.getElementById("stop") as HTMLButtonElement;

play.addEventListener("click", async () => {
  await runtime.play();
});

stop.addEventListener("click", () => {
  runtime.stop();
});