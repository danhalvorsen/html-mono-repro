
import "./style.css";
import { ThreeApplication } from "./three/ThreeApplication.ts";

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

const application = new ThreeApplication(threeRoot);
application.start();
