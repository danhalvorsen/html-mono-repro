import type { GraphElementControllerHost } from "../../GraphElementControllers.js";
import type { GraphConnectionPointClickDetail } from "./GraphConnectionPointClickDetail.js";

export function resolveConnectionPointDetail(
  host: GraphElementControllerHost,
  boxId: string,
  connectionPointId: string,
  originalEvent: MouseEvent | PointerEvent,
): GraphConnectionPointClickDetail {
  const scene = host.getScene();
  const box = scene.nodes.find((candidate) => candidate.id === boxId);

  if (box === undefined) {
    throw new Error(`Graph box '${boxId}' was not found in the current scene.`);
  }

  const connectionPoint = box.connectionPoints.find((candidate) => candidate.id === connectionPointId);

  if (connectionPoint === undefined) {
    throw new Error(`Graph connection point '${connectionPointId}' was not found in node '${boxId}'.`);
  }

  return {
    box,
    connectionPoint,
    scene,
    originalEvent,
  };
}

export function resolveConnectionPointDetailByConnectionPointId(
  host: GraphElementControllerHost,
  connectionPointId: string,
  originalEvent: PointerEvent,
): GraphConnectionPointClickDetail {
  const scene = host.getScene();

  for (const box of scene.nodes) {
    const connectionPoint = box.connectionPoints.find((candidate) => candidate.id === connectionPointId);

    if (connectionPoint !== undefined) {
      return {
        box,
        connectionPoint,
        scene,
        originalEvent,
      };
    }
  }

  throw new Error(`Graph connection point '${connectionPointId}' was not found in the current scene.`);
}
