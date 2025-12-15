import { createDemoUI } from './demo-ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  if (!root) throw new Error('Missing #app element');

  const ui = createDemoUI();
  const el = ui.createElement();

  // Attach the backing model to the rendered element
  (el as any).model = ui;

  root.appendChild(el);
});
