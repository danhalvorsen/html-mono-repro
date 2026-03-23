 
# 🎯 Epic 1 — Oscillator Engine Core

---

## 📦 Feature 1 — Basic Waveform Generation

### US1.1 — Generate sine waveform

**DEV Tasks**

* **DEV-1.1.1 — Implement phase accumulator core**
  → (3h, 5h, 8h) | (0.3, 0.5, 0.2)

* **DEV-1.1.2 — Implement sine calculation (lookup / fallback)**
  → (2h, 4h, 7h) | (0.3, 0.5, 0.2)

**UX Tasks**

* **UX-1.1.1 — Design waveform selector interaction states**
  → (2h, 3h, 5h) | (0.4, 0.4, 0.2)

* **UX-1.1.2 — Implement sine waveform preview component**
  → (3h, 5h, 8h) | (0.3, 0.5, 0.2)

---

### US1.2 — Generate square waveform

**DEV Tasks**

* **DEV-1.2.1 — Implement square waveform generator**
  → (3h, 5h, 9h) | (0.3, 0.4, 0.3)

* **DEV-1.2.2 — Add duty cycle parameter handling**
  → (4h, 7h, 12h) | (0.2, 0.5, 0.3)

**UX Tasks**

* **UX-1.2.1 — Design duty cycle control (knob/slider)**
  → (3h, 5h, 8h) | (0.3, 0.5, 0.2)

* **UX-1.2.2 — Render square waveform preview**
  → (2h, 4h, 7h) | (0.4, 0.4, 0.2)

---

## 📦 Feature 2 — Frequency & Pitch Control

### US2.1 — Set frequency in Hz

**DEV Tasks**

* **DEV-2.1.1 — Implement frequency setter API**
  → (2h, 4h, 6h) | (0.4, 0.4, 0.2)

* **DEV-2.1.2 — Add frequency validation and clamping**
  → (2h, 3h, 5h) | (0.4, 0.4, 0.2)

**UX Tasks**

* **UX-2.1.1 — Implement numeric frequency input field**
  → (2h, 3h, 5h) | (0.4, 0.4, 0.2)

* **UX-2.1.2 — Implement frequency knob interaction**
  → (3h, 5h, 9h) | (0.3, 0.5, 0.2)

---

### US2.2 — Support MIDI note input

**DEV Tasks**

* **DEV-2.2.1 — Map MIDI note to frequency**
  → (4h, 7h, 12h) | (0.2, 0.5, 0.3)

* **DEV-2.2.2 — Integrate MIDI input handling service**
  → (5h, 9h, 15h) | (0.2, 0.5, 0.3)

**UX Tasks**

* **UX-2.2.1 — Display active MIDI note indicator**
  → (2h, 3h, 6h) | (0.4, 0.4, 0.2)

* **UX-2.2.2 — Render note label (e.g., A4, C#3)**
  → (2h, 4h, 7h) | (0.3, 0.5, 0.2)

---

## 📦 Feature 3 — Phase & Sync Handling

### US3.1 — Implement phase accumulator

**DEV Tasks**

* **DEV-3.1.1 — Implement phase accumulator update loop**
  → (5h, 9h, 15h) | (0.2, 0.5, 0.3)

* **DEV-3.1.2 — Handle phase wrap-around precision**
  → (3h, 6h, 10h) | (0.3, 0.5, 0.2)

**UX Tasks**

* **UX-3.1.1 — Implement phase visualization (debug scope)**
  → (4h, 7h, 12h) | (0.2, 0.5, 0.3)

* **UX-3.1.2 — Add phase reset toggle control**
  → (2h, 3h, 5h) | (0.4, 0.4, 0.2)

---

## 📦 Feature 4 — Modulation Support

### US4.1 — Apply LFO to frequency

**DEV Tasks**

* **DEV-4.1.1 — Implement LFO oscillator module**
  → (6h, 10h, 18h) | (0.2, 0.5, 0.3)

* **DEV-4.1.2 — Implement modulation routing system**
  → (6h, 11h, 20h) | (0.2, 0.5, 0.3)

**UX Tasks**

* **UX-4.1.1 — Implement LFO rate and depth controls**
  → (3h, 6h, 10h) | (0.3, 0.5, 0.2)

* **UX-4.1.2 — Render modulation visualization overlay**
  → (5h, 9h, 15h) | (0.2, 0.5, 0.3)

---

### US4.2 — Apply envelope to amplitude

**DEV Tasks**

* **DEV-4.2.1 — Implement ADSR envelope engine**
  → (6h, 10h, 18h) | (0.2, 0.5, 0.3)

* **DEV-4.2.2 — Apply envelope to output gain**
  → (4h, 7h, 12h) | (0.3, 0.5, 0.2)

**UX Tasks**

* **UX-4.2.1 — Implement ADSR curve editor UI**
  → (6h, 10h, 16h) | (0.2, 0.5, 0.3)

* **UX-4.2.2 — Implement envelope preset selector**
  → (3h, 5h, 8h) | (0.3, 0.5, 0.2)

---

## 📦 Feature 5 — Performance & Audio Quality

### US5.1 — Anti-aliasing (band-limited)

**DEV Tasks**

* **DEV-5.1.1 — Implement PolyBLEP correction**
  → (12h, 20h, 36h) | (0.1, 0.5, 0.4)

* **DEV-5.1.2 — Integrate anti-aliasing into waveform pipeline**
  → (8h, 14h, 24h) | (0.2, 0.5, 0.3)

**UX Tasks**

* **UX-5.1.1 — Implement quality mode selector**
  → (2h, 4h, 6h) | (0.4, 0.4, 0.2)

* **UX-5.1.2 — Implement CPU usage indicator**
  → (3h, 6h, 10h) | (0.3, 0.5, 0.2)

---

### US5.2 — Optimize DSP loop

**DEV Tasks**

* **DEV-5.2.1 — Implement buffer-based processing loop**
  → (6h, 10h, 18h) | (0.2, 0.5, 0.3)

* **DEV-5.2.2 — Apply SIMD/vector optimizations**
  → (10h, 18h, 30h) | (0.2, 0.5, 0.3)

**UX Tasks**

* **UX-5.2.1 — Implement performance diagnostics panel**
  → (4h, 7h, 12h) | (0.3, 0.5, 0.2)

* **UX-5.2.2 — Implement latency visualization graph**
  → (3h, 5h, 9h) | (0.3, 0.5, 0.2)
