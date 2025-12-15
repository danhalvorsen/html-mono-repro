import { LitElement, html } from "lit";
import { NoteParser } from "./NoteParser.1.js";

/* ============================================================
   note-editor-wc.ts
   ============================================================ */

export class NoteEditorWC extends LitElement {
    sheet?: any;

    firstUpdated() {
        this.sheet = this.renderRoot.querySelector("note-sheet-wc");
    }

    onInput(e: any) {
        const parser = new NoteParser();
        const notes = parser.parse(e.target.value);
        this.sheet?.addNotes?.(notes);
    }

    render() {
        return html`
      <textarea @input=${this.onInput} rows="4" cols="40"></textarea>
      <note-sheet-wc></note-sheet-wc>
    `;
    }
}
