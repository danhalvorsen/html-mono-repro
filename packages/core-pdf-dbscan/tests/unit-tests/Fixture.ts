export class Fixture {
    public createFragment(x: number, y: number) {
        return {
            kind: "rectangle" as const,
            pageNumber: 1,
            boundingBox: {
                position: { x, y },
                width: 1,
                height: 1,
            },
        };
    }

    public clusterWithSingleIsolatedNoiseCandidate() {
        return Object.freeze([
            this.createFragment(0, 0),
            this.createFragment(1, 0),
            this.createFragment(0, 1),
            this.createFragment(20, 20),
        ]);
    }
}
