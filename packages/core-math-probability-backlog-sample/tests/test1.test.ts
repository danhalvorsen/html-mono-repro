import { describe, it, expect } from "vitest";

import {
  AsymmetricThreePointShapeMapper,
  BacklogJsonProjectAdapter,
  type IBacklogRootJson,
} from "../src/index.js";

describe("BacklogJsonProjectAdapter", () => {
  it("should map minimal backlog correctly", () => {
    const backlog: IBacklogRootJson = {
      epics: [
        {
          id: "EPIC-1",
          title: "Test Epic",
          features: [
            {
              id: "F-1",
              title: "Test Feature",
              userStories: [
                {
                  id: "US-1",
                  title: "Test Story",
                  tasks: [
                    {
                      id: "T-1",
                      type: "DEV",
                      title: "Implement core",
                      estimate: {
                        optimistic: 2,
                        mostLikely: 5,
                        pessimistic: 10,
                      },
                    },
                    {
                      id: "T-2",
                      type: "UX",
                      title: "Design UI",
                      estimate: {
                        optimistic: 1,
                        mostLikely: 3,
                        pessimistic: 6,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const sut = new BacklogJsonProjectAdapter(
      new AsymmetricThreePointShapeMapper(),
    );

    const result = sut.map(backlog);

    // identity
    expect(result.id).toBe("EPIC-1");
    expect(result.name).toBe("Test Epic");

    // structure
    expect(result.features).toHaveLength(1);
    expect(result.features[0].stories).toHaveLength(1);
    expect(result.features[0].stories[0].tasks).toHaveLength(2);

    // ranges
    const task = result.features[0].stories[0].tasks[0];
    expect(task.range.minimum).toBe(2);
    expect(task.range.mostLikely).toBe(5);
    expect(task.range.maximum).toBe(10);

    // naming
    const names = result.features[0].stories[0].tasks.map((t) => t.name);
    expect(names[0]).toContain("[DEV]");
    expect(names[1]).toContain("[UX]");

    // shape
    const shapes = result.features[0].stories[0].tasks.map((t) => t.shape);
    for (const shape of shapes) {
      expect(shape).toBeDefined();
      expect(shape.tailWeight).toBeGreaterThan(0);
    }

    // distribution kind (string-based assumption)
    const kinds = result.features[0].stories[0].tasks.map((t) => t.distributionKind);
    expect(new Set(kinds)).toEqual(new Set(["SkewNormal"]));
  });

  it("should produce right-skewed shape for asymmetric estimate", () => {
    const backlog: IBacklogRootJson = {
      epics: [
        {
          id: "E",
          title: "Skew Test",
          features: [
            {
              id: "F",
              title: "Feature",
              userStories: [
                {
                  id: "S",
                  title: "Story",
                  tasks: [
                    {
                      id: "T",
                      type: "DEV",
                      title: "Skewed task",
                      estimate: {
                        optimistic: 2,
                        mostLikely: 4,
                        pessimistic: 12,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const sut = new BacklogJsonProjectAdapter(
      new AsymmetricThreePointShapeMapper(),
    );

    const result = sut.map(backlog);
    const shape = result.features[0].stories[0].tasks[0].shape;

    expect(shape.optimismBias).toBeGreaterThan(0);
    expect(shape.confidence).toBeGreaterThanOrEqual(0.2);
    expect(shape.confidence).toBeLessThanOrEqual(0.9);
  });
});