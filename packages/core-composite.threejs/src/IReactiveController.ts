// ============================================================================

export interface IReactiveController {
    hostConnected?(): void;
    hostDisconnected?(): void;

    hostUpdate?(): void; // BEFORE host.render()
    hostUpdated?(): void; // AFTER host.render()
}
