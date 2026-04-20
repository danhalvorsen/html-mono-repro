import { HttpClientBuilder } from '@monorepo/core-http-messages-http-client';
import {
  HeaderName,
  HeadersBuilder,
  HttpRequestMessageBuilder,
} from '@monorepo/core-http-messages';
import {
  LayoutCompositionRoot,
  type Bounds,
  type CreateRectangleGroupsRequest,
} from '@monorepo/core-group-shape-test-data';

const DEFAULT_URL = 'http://127.0.0.1:3000/api/commands/save';
const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 1200;

function toInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isInteger(parsed) ? parsed : fallback;
}

function usage(): void {
  console.log(
    'Usage: pnpm send:rectangle-data -- [groups] [min] [max] [groupDistanceMin] [groupDistanceMax] [seed] [url]  (groups spread across q0..q3)',
  );
}

function createQuadrants(): ReadonlyArray<Bounds> {
  const halfWidth = Math.floor(WORLD_WIDTH / 2);
  const halfHeight = Math.floor(WORLD_HEIGHT / 2);
  return [
    { x: 0, y: 0, width: halfWidth, height: halfHeight }, // q0
    { x: halfWidth, y: 0, width: WORLD_WIDTH - halfWidth, height: halfHeight }, // q1
    { x: 0, y: halfHeight, width: halfWidth, height: WORLD_HEIGHT - halfHeight }, // q2
    { x: halfWidth, y: halfHeight, width: WORLD_WIDTH - halfWidth, height: WORLD_HEIGHT - halfHeight }, // q3
  ];
}

function groupsPerQuadrant(totalGroups: number): ReadonlyArray<number> {
  const base = Math.floor(totalGroups / 4);
  const remainder = totalGroups % 4;
  return [0, 1, 2, 3].map((index) => base + (index < remainder ? 1 : 0));
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const args = rawArgs[0] === '--' ? rawArgs.slice(1) : rawArgs;
  if (args[0] === '--help' || args[0] === '-h') {
    usage();
    return;
  }

  const groups = toInt(args[0], 3);
  const min = toInt(args[1], 2);
  const max = toInt(args[2], 8);
  const groupDistanceMin = toInt(args[3], 30);
  const groupDistanceMax = toInt(args[4], 1000);
  const seed = toInt(args[5], 12345);
  const url = args[6] ?? process.env.SAVE_API_URL ?? DEFAULT_URL;

  if (groups <= 0 || min <= 0 || max < min || groupDistanceMin < 0 || groupDistanceMax < groupDistanceMin) {
    usage();
    throw new Error('Invalid arguments.');
  }

  const quadrants = createQuadrants();
  const counts = groupsPerQuadrant(groups);
  const rectangles = quadrants.flatMap((quadrant, quadrantIndex) => {
    const count = counts[quadrantIndex];
    if (count === 0) {
      return [];
    }

    const generator = LayoutCompositionRoot.createRectangleGroupLayoutGenerator(
      seed + quadrantIndex,
    );
    const request: CreateRectangleGroupsRequest = {
      numberOfGroups: count,
      worldBounds: quadrant,
      groupSizeRange: { minWidth: 120, maxWidth: 180, minHeight: 120, maxHeight: 180 },
      groupDistanceRange: { min: groupDistanceMin, max: groupDistanceMax },
      rectangleSizeRange: { minWidth: 12, maxWidth: 24, minHeight: 12, maxHeight: 24 },
      rectangleDistanceRange: { min: 4, max: 300 },
      rectanglesPerGroupRange: { min, max },
    };

    const layout = generator.create(request);
    return layout.groups.flatMap((group) =>
      group.rectangles.map((rectangle) => ({
        x: rectangle.x,
        y: rectangle.y,
        width: rectangle.width,
        height: rectangle.height,
      })),
    );
  });

  const requestMessage = new HttpRequestMessageBuilder()
    .withMethod('POST')
    .withPath(url)
    .withHeaders(
      new HeadersBuilder()
        .with(HeaderName.Accept, 'application/json')
        .with(HeaderName.ContentType, 'application/json')
        .build(),
    )
    .withBody({ rectangles })
    .build();

  const response = await new HttpClientBuilder().build().send(requestMessage);

  console.log(
    `[send-rectangle-data] groups=${groups} q0..q3=${counts.join('/')} min=${min} max=${max} distance=${groupDistanceMin}-${groupDistanceMax} seed=${seed} rectangles=${rectangles.length}`,
  );
  console.log(response.statusCode);
  console.log(JSON.stringify(response.body, null, 2));
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
