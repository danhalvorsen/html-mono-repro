import { LitElement, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import "./components/piano-root";
import "./components/piano-octave";
import "./components/tangent-wc";
import "./components/waterfall/piano-waterfall-new";
import "./components/waterfall/piano-waterfall-column";
import "./components/waterfall/played-note-wc";

import {
  DefaultPianoRootConfiguration,
  type PianoRootConfiguration,
} from "./components/PianoRootConfiguration";
import {
  PianoRootConfigurationScaler,
  type Scale2,
} from "./components/PianoRootConfigurationScaler";

@customElement("piano-app")
export class PianoApp extends LitElement {
  private readonly sourceOptions: PianoRootConfiguration =
    DefaultPianoRootConfiguration;

  private readonly scaler = new PianoRootConfigurationScaler();

  @property({ attribute: false })
  public scale: Scale2 = { x: 1, y: 1 };

  protected override render(): TemplateResult {
    const options = this.scaler.scale(this.sourceOptions, this.scale);

    return html`
      <piano-root-new .options=${options}>
        <piano-waterfall-new .options=${options.waterfall}>
          ${options.waterfall.columns.map(
            (column, index) => html`
              <column-wc slot=${`column-${index}`} .options=${column}>
                <played-note-wc .options=${column.playedNote}></played-note-wc>
              </column-wc>
            `
          )}
        </piano-waterfall-new>

        ${options.octaves.map(
          (octave) => html`
            <piano-octave id=${octave.id} .options=${octave}></piano-octave>
          `
        )}
      </piano-root-new>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "piano-app": PianoApp;
  }
}
