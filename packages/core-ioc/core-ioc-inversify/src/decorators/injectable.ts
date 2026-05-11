import "reflect-metadata";
import { injectable as inversifyInjectable } from "inversify";

/**
 * @Injectable @customElement('injectable') (thin alias to Inversify)
 */
export const Injectable = inversifyInjectable;
// ...existing code...