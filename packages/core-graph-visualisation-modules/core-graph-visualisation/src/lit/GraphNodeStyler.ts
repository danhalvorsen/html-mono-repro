import type { GraphSvgScene } from "../GraphSvgScene.js";
import type { IGraphNodeStyler } from "./contracts.js";
import type {
  GraphAutoScaleMetrics,
  GraphNodeHierarchy,
  GraphNodeVisualStyle,
  GraphSceneNode,
} from "./types.js";

export class GraphNodeStyler implements IGraphNodeStyler {
  constructor(
    private readonly boxWidth: number,
    private readonly boxHeight: number,
  ) {}

  createNodeVisualStyle(
    node: GraphSceneNode,
    hierarchy: GraphNodeHierarchy | undefined,
    autoScaleMetrics: GraphAutoScaleMetrics,
  ): GraphNodeVisualStyle {
    const level = hierarchy?.level ?? 0;
    const maxLevel = hierarchy?.maxLevel ?? 0;
    const subLevel = hierarchy?.subLevel ?? 0;
    const levelSize = hierarchy?.levelSize ?? 1;
    const subgraphIndex = hierarchy?.subgraphIndex ?? 0;

    const depthRatio = maxLevel === 0 ? 0 : (level / maxLevel);
    const levelScale = Math.max(0.84, Math.min(1.12, 1.08 - (depthRatio * 0.22)));
    const sizeScale = levelScale * autoScaleMetrics.nodeScale;
    const width = node.box.width * sizeScale;
    const height = node.box.height * sizeScale;
    const topLeftX = node.center.x - (width / 2);
    const topLeftY = node.center.y - (height / 2);

    const hue = this.getPaletteHueForNode(level, subgraphIndex);
    const baseLightness = 31 + ((level % 3) * 3);
    const subLevelRatio = levelSize <= 1 ? 0 : (subLevel / (levelSize - 1));
    const shadeOffset = (subLevelRatio - 0.5) * 10;
    const fillLightness = Math.max(25, Math.min(47, baseLightness + shadeOffset));
    const strokeLightness = Math.max(18, fillLightness - 9);
    const textLightness = Math.min(98, fillLightness + 56);

    return {
      fill: `hsl(${hue} 52% ${fillLightness}%)`,
      stroke: `hsl(${hue} 56% ${strokeLightness}%)`,
      text: `hsl(${hue} 42% ${textLightness}%)`,
      width,
      height,
      topLeftX,
      topLeftY,
    };
  }

  createNodeColorStyle(
    hierarchy: GraphNodeHierarchy | undefined,
  ): Pick<GraphNodeVisualStyle, "fill" | "stroke" | "text"> {
    const level = hierarchy?.level ?? 0;
    const subLevel = hierarchy?.subLevel ?? 0;
    const levelSize = hierarchy?.levelSize ?? 1;
    const subgraphIndex = hierarchy?.subgraphIndex ?? 0;
    const hue = this.getPaletteHueForNode(level, subgraphIndex);
    const baseLightness = 31 + ((level % 3) * 3);
    const subLevelRatio = levelSize <= 1 ? 0 : (subLevel / (levelSize - 1));
    const shadeOffset = (subLevelRatio - 0.5) * 10;
    const fillLightness = Math.max(25, Math.min(47, baseLightness + shadeOffset));
    const strokeLightness = Math.max(18, fillLightness - 9);
    const textLightness = Math.min(98, fillLightness + 56);

    return {
      fill: `hsl(${hue} 52% ${fillLightness}%)`,
      stroke: `hsl(${hue} 56% ${strokeLightness}%)`,
      text: `hsl(${hue} 42% ${textLightness}%)`,
    };
  }

  createAutoScaleMetrics(
    scene: GraphSvgScene,
    hierarchyByNodeId: ReadonlyMap<string, GraphNodeHierarchy>,
  ): GraphAutoScaleMetrics {
    if (scene.nodes.length === 0) {
      return { nodeScale: 1 };
    }

    let maxLevel = 0;
    const levelNodeCounts = new Map<number, number>();

    hierarchyByNodeId.forEach((hierarchy) => {
      maxLevel = Math.max(maxLevel, hierarchy.level);
      levelNodeCounts.set(hierarchy.level, (levelNodeCounts.get(hierarchy.level) ?? 0) + 1);
    });

    const maxNodesInAnyLevel = Math.max(1, ...Array.from(levelNodeCounts.values()));
    const levelCount = Math.max(1, maxLevel + 1);
    const availableWidth = Math.max(1, scene.boundary.width - 28);
    const availableHeight = Math.max(1, scene.boundary.height - 28);
    const widthPerNode = availableWidth / (maxNodesInAnyLevel + 0.35);
    const heightPerLevel = availableHeight / (levelCount + 0.4);
    const widthScale = widthPerNode / this.boxWidth;
    const heightScale = heightPerLevel / this.boxHeight;

    const targetCoverage = 0.2;
    const densityScale = Math.sqrt(
      (availableWidth * availableHeight * targetCoverage)
        / Math.max(1, scene.nodes.length * this.boxWidth * this.boxHeight),
    );

    return {
      nodeScale: Math.max(0.52, Math.min(1.28, Math.min(widthScale, heightScale, densityScale))),
    };
  }

  private getPaletteHueForNode(level: number, subgraphIndex: number): number {
    const subgraphPalettes: readonly (readonly number[])[] = [
      [148, 156, 164, 172, 180],
      [214, 206, 198, 190, 182],
      [28, 34, 40, 46, 52],
      [286, 278, 270, 262, 254],
      [346, 338, 330, 322, 314],
      [186, 178, 170, 162, 154],
    ];
    const defaultPalette: readonly number[] = [148, 156, 164, 172, 180];
    const palette = subgraphPalettes[subgraphIndex % subgraphPalettes.length] ?? defaultPalette;

    return palette[level % palette.length] ?? palette[0] ?? 148;
  }
}
