import type { ReactiveController, ReactiveControllerHost } from "lit";
import type {
  AstarSettings,
  AstarStats,
} from "../contracts/AstarVisualizerContracts.js";
import type { IAstarEnginePort } from "../ports/IAstarEnginePort.js";

export interface AstarSettingsValidationResult {
  readonly isValid: boolean;
  readonly errorMessage: string | null;
}

export interface IAstarSettingsValidator {
  validate(settings: AstarSettings): AstarSettingsValidationResult;
}

export class DefaultAstarSettingsValidator implements IAstarSettingsValidator {
  public validate(settings: AstarSettings): AstarSettingsValidationResult {
    if (!Number.isFinite(settings.weight) || settings.weight <= 0) {
      return {
        isValid: false,
        errorMessage: "A* weight must be greater than zero.",
      };
    }

    return {
      isValid: true,
      errorMessage: null,
    };
  }
}

export interface IAstarSettingsHost extends ReactiveControllerHost {
  readonly stats: AstarStats;

  setSettings(settings: AstarSettings): void;
  rejectSettingsChange(result: AstarSettingsValidationResult): void;
}

export class AstarSettingsController implements ReactiveController {
  private readonly host: IAstarSettingsHost;
  private readonly validator: IAstarSettingsValidator;
  private enginePort: IAstarEnginePort | null = null;

  public constructor(
    host: IAstarSettingsHost,
    validator?: IAstarSettingsValidator,
  ) {
    this.host = host;
    this.validator = validator ?? new DefaultAstarSettingsValidator();

    this.host.addController(this);
  }

  public hostConnected(): void {
    // Host connected
  }

  public hostDisconnected(): void {
    // Host disconnected
  }

  public setEnginePort(enginePort: IAstarEnginePort | null): void {
    this.enginePort = enginePort;
  }

  public applySettings(settings: AstarSettings): boolean {
    if (this.host.stats.status === "running") {
      this.host.rejectSettingsChange({
        isValid: false,
        errorMessage: "Cannot change A* settings while visualization is running.",
      });

      return false;
    }

    const validation = this.validator.validate(settings);

    if (!validation.isValid) {
      this.host.rejectSettingsChange(validation);
      return false;
    }

    this.enginePort?.configure(settings);
    this.host.setSettings(settings);

    return true;
  }
}
