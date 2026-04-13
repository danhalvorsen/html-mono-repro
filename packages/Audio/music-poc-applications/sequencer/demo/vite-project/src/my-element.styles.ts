import { css } from "lit";

export const myElementStyles = css`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 24px;
    box-sizing: border-box;
    background: var(--demo-root-bg);
    color: var(--demo-text);
  }

  .container {
    width: min(760px, 96vw);
    display: grid;
    gap: 14px;
    background: var(--demo-shell-bg);
    border: 1px solid var(--demo-shell-border);
    border-radius: 12px;
    padding: 16px;
    color: var(--demo-text);
  }

  h2 {
    margin: 0;
    font-size: 1.1rem;
    letter-spacing: 0.02em;
  }

  .field-label {
    font-size: 0.84rem;
    color: var(--demo-text-muted);
  }

  .gallery {
    display: grid;
    gap: 10px;
    border: 1px solid var(--demo-panel-border);
    border-radius: 10px;
    background: var(--demo-panel-bg);
    padding: 12px;
  }

  .gallery-preview {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 4px 0;
  }

  .gallery-scroll {
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 2px;
  }

  .gallery-header {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: baseline;
    color: var(--demo-text-strong);
    font-size: 0.86rem;
  }

  .gallery-state {
    color: var(--demo-text-state);
    font-size: 0.84rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }

  .source-name {
    width: 100%;
    border-radius: 8px;
    border: 1px solid var(--demo-field-border);
    background: var(--demo-field-bg);
    color: var(--demo-text-bright);
    padding: 8px;
    box-sizing: border-box;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.87rem;
  }

  .notes-input {
    width: 100%;
    border-radius: 8px;
    border: 1px solid var(--demo-field-border);
    background: var(--demo-field-bg);
    color: var(--demo-text-bright);
    padding: 10px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.95rem;
    line-height: 1.4;
    resize: vertical;
    box-sizing: border-box;
  }

  .notes-visualizer {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 42px;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid var(--demo-table-border);
    background: var(--demo-table-bg);
  }

  .summary-header {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: 0.84rem;
    color: var(--demo-text-strong);
  }

  .summary-grid {
    border: 1px solid var(--demo-table-border);
    border-radius: 8px;
    background: var(--demo-table-bg);
    overflow: auto;
    max-height: 240px;
  }

  .summary-row {
    display: grid;
    grid-template-columns: 38px minmax(120px, 1fr) 72px 44px 54px 54px 72px 56px 60px 60px 60px;
    gap: 8px;
    align-items: center;
    padding: 7px 10px;
    border-bottom: 1px solid var(--demo-table-border);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.78rem;
    color: var(--demo-text-row);
  }

  .summary-row:last-child {
    border-bottom: none;
  }

  .summary-head {
    position: sticky;
    top: 0;
    background: var(--demo-table-head-bg);
    color: var(--demo-text-bright);
    font-weight: 700;
    z-index: 1;
  }

  .summary-row.active {
    background: var(--demo-row-active-bg);
    color: var(--demo-text-bright);
  }

  .note {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 8px;
    border: 1px solid var(--demo-note-border);
    color: var(--demo-text-row);
    background: var(--demo-note-bg);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.86rem;
    transition: transform 90ms ease, background-color 90ms ease, color 90ms ease;
  }

  .note.active {
    background: var(--demo-note-active-bg);
    border-color: var(--demo-note-active-border);
    color: var(--demo-shell-bg);
    transform: translateY(-1px) scale(1.03);
    font-weight: 700;
  }

  button {
    justify-self: start;
    border: 1px solid var(--demo-button-border);
    background: var(--demo-button-bg);
    color: var(--demo-text-bright);
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 0.95rem;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .error {
    margin: 0;
    color: var(--demo-error-text);
    font-size: 0.9rem;
  }
`;
