import { Waterfall } from "./music-waterfall.ts";

function connectAddButton(): void {
  const button = document.querySelector<HTMLButtonElement>("#add");
  const waterfall = document.querySelector<Waterfall>("waterfall-component");

  if (button === null || waterfall === null) {
    return;
  }

  button.addEventListener("click", () => {
    waterfall.addGravityFalling();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", connectAddButton, {
    once: true,
  });
} else {
  connectAddButton();
}
