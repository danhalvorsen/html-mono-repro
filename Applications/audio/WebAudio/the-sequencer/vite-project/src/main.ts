import "./style.css";
import { mountSequencerApp } from "./sequencer/sequencer";

const app = document.querySelector<HTMLDivElement>("#app");

if (app === null) {
  throw new Error("#app root node was not found.");
}

mountSequencerApp(app);
