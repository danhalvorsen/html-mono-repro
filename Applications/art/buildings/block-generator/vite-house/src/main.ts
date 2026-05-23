
import "./style.css";
import { ThreeApplication } from "./three/ThreeApplication.ts";

type StoppableApp = {
  stop: () => void;
};

declare global {
  interface Window {
    __viteHouseApp?: StoppableApp;
  }
}

window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  const message = reason instanceof Error ? reason.message : String(reason ?? "");
  if (message.includes("A listener indicated an asynchronous response by returning true")) {
    event.preventDefault();
  }
});

const app = document.querySelector<HTMLDivElement>("#app");
if (app === null) {
  throw new Error("Missing '#app' host element.");
}

app.innerHTML = `
  <section class="viewport-shell">
    <div id="three-root" class="three-root"></div>
  </section>
`;

const threeRoot = document.querySelector<HTMLDivElement>("#three-root");
if (threeRoot === null) {
  throw new Error("Missing '#three-root' host element.");
}

window.__viteHouseApp?.stop();

const application = new ThreeApplication(threeRoot);
application.start();
window.__viteHouseApp = application;

if (import.meta.hot !== undefined) {
  import.meta.hot.dispose(() => {
    window.__viteHouseApp?.stop();
    delete window.__viteHouseApp;
  });
}
