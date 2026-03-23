// =====================================================================================
// FILE: tests/unit/01.BacklogJsonProjectAdapter.spec.ts
// PURPOSE:
// - Verify JSON → domain mapping (no probability engine involved)
// - Guarantees adapter correctness before Monte Carlo layer
// =====================================================================================

import {
  AsymmetricThreePointShapeMapper,
  BacklogJsonProjectAdapter,
  type IBacklogRootJson,
} from "../src/index.js";

import { specification, given, when, then, expect } from "./specification.js"

specification("BacklogJsonProjectAdapter", () => {
  given("a backlog json with a minimal hierarchy", () => {
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

    when("mapping backlog json to project estimate", () => {
      const result = sut.map(backlog);

      then("the project identity should be derived from epics", () => {
        expect(result.id).toBe("EPIC-1");
        expect(result.name).toBe("Test Epic");
      });

      then("the hierarchy should be preserved", () => {
        expect(result.features).toHaveLength(1);
        expect(result.features[0].stories).toHaveLength(1);
        expect(result.features[0].stories[0].tasks).toHaveLength(2);
      });

      then("tasks should be mapped with correct domain ranges", () => {
        const task = result.features[0].stories[0].tasks[0];

        expect(task.range.minimum).toBe(2);
        expect(task.range.mostLikely).toBe(5);
        expect(task.range.maximum).toBe(10);
      });

      then("task naming should include type information", () => {
        const names = result.features[0].stories[0].tasks.map((t: { name: any; }) => t.name);

        expect(names[0]).toContain("[DEV]");
        expect(names[1]).toContain("[UX]");
      });

      then("a shape should be generated for each task", () => {
        const shapes = result.features[0].stories[0].tasks.map((t: { shape: any; }) => t.shape);

        for (const shape of shapes) {
          expect(shape).toBeDefined();
          expect(shape.tailWeight).toBeGreaterThan(0);
        }
      });

      then("distribution kind should default to skew-normal", () => {
        const kinds = result.features[0].stories[0].tasks.map((t: { distributionKind: any; }) => t.distributionKind);

        expect(new Set(kinds)).toEqual(new Set(["SkewNormal"]));
      });
    });
  });

  given("an asymmetric estimate (right skew)", () => {
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

    when("mapping backlog json to project estimate", () => {
      const result = sut.map(backlog);
      const shape = result.features[0].stories[0].tasks[0].shape;

      then("the resulting shape should reflect right skew", () => {
        expect(shape.optimismBias).toBeGreaterThan(0);
      });

      then("confidence should remain within valid bounds", () => {
        expect(shape.confidence).toBeGreaterThanOrEqual(0.2);
        expect(shape.confidence).toBeLessThanOrEqual(0.9);
      });
    });
  });
});