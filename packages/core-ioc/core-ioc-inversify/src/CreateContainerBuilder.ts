import { ServiceCollection } from "./ico.js";


export function CreateContainerBuilder() {
    return { Services: new ServiceCollection() };
}
