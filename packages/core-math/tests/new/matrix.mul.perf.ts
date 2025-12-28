import { Matrix4d } from "core-math/src/interfaces/new/gpu/matrix4d.js";
import { Matrix4dAdapter } from "core-math/src/interfaces/new/gpu/Matrix4dAdapter.js";

const OPS = 100_000;

function now(): number {
  return Number(process.hrtime.bigint()) / 1e6; // ms
}

function warmup() {
  const m = new Matrix4d();
  for (let i = 0; i < 10_000; i++) {
    m.multiply(m);
  }
}

/* ---------------- FAST (new) ---------------- */

function runFast(): number {
  const a = new Matrix4d();
  const b = new Matrix4d();

  const t0 = now();
  for (let i = 0; i < OPS; i++) {
    a.multiply(b); // in-place, no alloc
  }
  return now() - t0;
}

/* ---------------- SLOW (old / adapter) ---------------- */

function runSlow(): number {
  let a = new Matrix4dAdapter(new Matrix4d());
  const b = new Matrix4dAdapter(new Matrix4d());

  const t0 = now();
for (let i = 0; i < OPS; i++) {
  a.multiply(b); // ✅ stays IMatrix
}
  return now() - t0;
}

/* ---------------- RUN ---------------- */

warmup(); // JIT warmup

const fastTime = runFast();
const slowTime = runSlow();

console.log('Matrix × Matrix benchmark');
console.log('Operations:', OPS.toLocaleString());
console.log('Fast (mutable):', fastTime.toFixed(2), 'ms');
console.log('Old (adapter): ', slowTime.toFixed(2), 'ms');
console.log('Speedup:       ', (slowTime / fastTime).toFixed(2), 'x');
