 console.log("HIT main.ts", import.meta.url);
//debugger;
// Applications/composistion/composistion-demo/src/main.ts
import "./demo-app.js";

const host = document.getElementById("app");
if (!host) throw new Error("Missing #app element");

host.appendChild(document.createElement("ui-demo-app"));