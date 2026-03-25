import type { IBox2 } from "@monorepo/core-math-rectangle";
import { BoxCompositionRoot } from "@monorepo/core-math-rectangle";
import {
    PlaceholderState,
    type IEdgeInset2,
    type IOccupiedPlacement,
    type IPlacementCandidate,
    type IPlacementContext,
    type IPlacementQuery,
    type IPlacementZone,
    type IPlaceholder,
    type IPlaceholderVisualPart,
    type IRectangleKind
} from "../../src/index.js";
import { PlaceholderIdFixture } from "./PlaceholderIdFixture.js";
import { PlacementZoneIdFixture } from "./PlacementZoneIdFixture.js";
import { RectangleKindFixture } from "../test-fixture.js";

export class RectanglePlacementFixture {
    private readonly boxModule: BoxCompositionRoot;

    public constructor() {
        this.boxModule = new BoxCompositionRoot();
    }

    public createWindowKind(): IRectangleKind {
        return new RectangleKindFixture("window");
    }

    public createDoorKind(): IRectangleKind {
        return new RectangleKindFixture("door");
    }

    public createHostBounds(): IBox2 {
        return this.boxModule.createAabb2FromMinMax(0, 0, 8, 3);
    }

    public createCandidateBounds(): IBox2 {
        return this.boxModule.createAabb2FromMinMax(1, 1, 2.2, 2.2);
    }

    public createOccupiedBounds(): IBox2 {
        return this.boxModule.createAabb2FromMinMax(3, 1, 4.2, 2.2);
    }

    public createMinimumBounds(): IBox2 {
        return this.boxModule.createAabb2FromMinMax(0, 0, 1.2, 1.2);
    }

    public createInset(): IEdgeInset2 {
        return {
            top: 0.3,
            bottom: 0.9,
            left: 0.5,
            right: 0.5,
        };
    }

    public createCandidate(kind: IRectangleKind = this.createWindowKind()): IPlacementCandidate {
        return {
            kind,
            bounds: this.createCandidateBounds(),
        };
    }

    public createOccupied(kind: IRectangleKind = this.createWindowKind()): IOccupiedPlacement {
        return {
            candidate: {
                kind,
                bounds: this.createOccupiedBounds(),
            },
        };
    }

    public createContext(): IPlacementContext {
        return {
            host: this.createHostBounds(),
            candidate: this.createCandidate(),
            occupied: [this.createOccupied()],
        };
    }

    public createQuery(kind: IRectangleKind = this.createWindowKind()): IPlacementQuery {
        return {
            kind,
            minimumBounds: this.createMinimumBounds(),
        };
    }

    public createZone(kind: IRectangleKind = this.createWindowKind()): IPlacementZone {
        return {
            id: new PlacementZoneIdFixture("main-window-zone"),
            bounds: this.boxModule.createAabb2FromMinMax(0.5, 0.9, 7.5, 2.7),
            allowedKinds: [kind],
        };
    }

    public createPlaceholderVisualParts(): readonly IPlaceholderVisualPart[] {
        return [
            {
                name: "bounds",
                bounds: this.boxModule.createAabb2FromMinMax(0.5, 0.9, 3.5, 2.7),
            },
            {
                name: "safe-area",
                bounds: this.boxModule.createAabb2FromMinMax(0.6, 1.0, 3.4, 2.6),
            },
        ];
    }

    public createPlaceholder(
        state: PlaceholderState = PlaceholderState.Free,
        kind: IRectangleKind = this.createWindowKind()
    ): IPlaceholder {
        return {
            id: new PlaceholderIdFixture("placeholder-1"),
            state,
            zone: this.createZone(kind),
            bounds: this.boxModule.createAabb2FromMinMax(0.5, 0.9, 3.5, 2.7),
            allowedKinds: [kind],
            visualParts: this.createPlaceholderVisualParts(),
        };
    }
}
