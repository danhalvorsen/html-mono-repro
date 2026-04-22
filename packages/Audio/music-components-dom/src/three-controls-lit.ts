import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("three-controls-lit")
export class ThreeControlsLit extends LitElement {
	static override styles = css`
		:host { display:block; font-family: system-ui, sans-serif; }
		.row { display:flex; gap:8px; align-items:center; margin-bottom:8px; }
		label { font-size:12px; display:flex; flex-direction:column; }
		textarea { width:420px; font-family: monospace; }
		input[type="range"] { width:140px; }
	`;

	@property({ type: String }) target = "";
	@property({ type: String }) abc = "";

	@state() private _translate = 0;
	@state() private _reveal = 200;
	@state() private _center = false;
	@state() private _halfLeft = false;
	@state() private _paused = false;

	private _debounceTimer: any = null;

	private getTargetManager() {
		const el = this.target ? document.getElementById(this.target) : null;
		// target expected to be <three-renderer> which exposes .manager
		return el && (el as any).manager ? (el as any).manager : null;
	}

	private applyControls() {
		const m = this.getTargetManager();
		if (!m) return;
		m.setControls({
			translateX: Number(this._translate),
			revealSpeed: Number(this._reveal),
			center: Boolean(this._center),
			coordHalfLeft: Boolean(this._halfLeft),
			paused: Boolean(this._paused),
		});
	}

	private onTextareaInput(e: Event) {
		const v = (e.target as HTMLTextAreaElement).value;
		clearTimeout(this._debounceTimer);
		this._debounceTimer = setTimeout(() => {
			const m = this.getTargetManager();
			if (m) m.setNotes(v);
		}, 300);
	}

	protected override render() {
		return html`
			<div class="row">
				<label>
					ABC
					<textarea @input=${this.onTextareaInput} rows="4">${this.abc}</textarea>
				</label>

				<label>
					Translate X
					<input type="range" min="-600" max="600" .value=${String(this._translate)}
						@input=${(e: Event) => { this._translate = Number((e.target as HTMLInputElement).value); this.applyControls(); }} />
				</label>

				<label>
					Reveal
					<input type="range" min="0" max="1000" .value=${String(this._reveal)}
						@input=${(e: Event) => { this._reveal = Number((e.target as HTMLInputElement).value); this.applyControls(); }} />
				</label>

				<label style="align-items:center;">
					<input type="checkbox" ?checked=${this._center}
						@change=${(e: Event) => { this._center = (e.target as HTMLInputElement).checked; this.applyControls(); }} />
					<span>Center</span>
				</label>

				<label style="align-items:center;">
					<input type="checkbox" ?checked=${this._halfLeft}
						@change=${(e: Event) => { this._halfLeft = (e.target as HTMLInputElement).checked; this.applyControls(); }} />
					<span>Half-left</span>
				</label>

				<label style="align-items:center;">
					<input type="checkbox" ?checked=${this._paused}
						@change=${(e: Event) => { this._paused = (e.target as HTMLInputElement).checked; this.applyControls(); }} />
					<span>Pause</span>
				</label>
			</div>
		`;
	}
}

export default ThreeControlsLit;
