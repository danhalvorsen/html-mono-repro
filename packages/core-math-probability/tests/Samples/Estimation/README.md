## Oscillator Module Backlog — Product Narrative

The oscillator is the foundational signal generator of the synthesizer—responsible for producing the raw audio waveforms that define the character of every sound. This backlog represents the initial evolution of a **modular, real-time oscillator engine** designed for both precision DSP and expressive control.

From a product perspective, the goal is to deliver an oscillator that is:

* **Sonically accurate** (band-limited, stable, predictable)
* **Performant in real-time environments** (low latency, no glitches)
* **Extensible by design** (modulation routing, waveform expansion)
* **Intuitive to control** (visual feedback, responsive UI)

---

### Why this backlog exists

Modern synthesizers require a balance between **DSP rigor** and **user interaction clarity**. Many oscillator implementations either:

* sacrifice performance for flexibility, or
* sacrifice usability for low-level control

This backlog addresses both concerns by structuring development around:

* **Deterministic DSP primitives** (phase accumulator, waveform generation)
* **Composable modulation systems** (LFO, envelope routing)
* **Real-time constraints** (buffer processing, anti-aliasing)
* **UX feedback loops** (waveform previews, modulation visualization)

The intent is to create a **production-grade oscillator core** that can scale from a simple mono synth to a complex modular system.

---

### How the system is approached

The system is decomposed along clear architectural boundaries:

#### 1. DSP Core Layer

* Phase accumulator drives waveform generation
* Stateless, deterministic processing per sample or buffer
* Anti-aliasing strategies (PolyBLEP) applied at generation level

#### 2. Control Layer

* Frequency, pitch, and modulation routing
* MIDI integration mapped to frequency domain
* Envelope and LFO as independent signal sources

#### 3. Integration Layer

* Buffer-based processing for real-time audio pipelines
* Synchronization between oscillators (hard sync, phase reset)

#### 4. UX Layer

* Visual waveform previews
* Parameter controls (knobs, sliders, selectors)
* Diagnostic overlays (CPU usage, modulation graphs)

This separation ensures **open–closed extensibility**—new waveform types, modulation sources, or UI components can be added without modifying the core engine.

---

### What success looks like

* Clean, alias-free audio across full frequency spectrum
* Stable performance under real-time constraints
* Clear mapping between user interaction and sound output
* Extensible architecture ready for:

  * FM synthesis
  * Wavetable oscillators
  * Modular routing systems

---

## Product Illustrations

### 🎛️ Oscillator UI Concept (Waveform + Controls)

![Image](https://cherryaudio-website.nyc3.cdn.digitaloceanspaces.com/assets/products/images/sh-max-ui-4-effects.jpg)

![Image](https://www.magneticmag.com/image/c_fit%2Ch_600%2Cw_600/MTk4ODU1MzEwMjMwNjkzNjM5/untitled-design---2023-06-22t170230297.png)

![Image](https://help.apple.com/assets/68389DB4C3F39646A809CC7F/68389DBC96FFB065CA03EC8D/en_US/3c3318b82fdd75e66472008ed2f87c68.png)

---

### 📈 Waveform Visualization (Sine, Square, Saw)

![Image](https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Waveforms.svg/1280px-Waveforms.svg.png)

![Image](https://images.equipboard.com/blog_content/oscillator-waveforms.jpg)

![Image](https://digilent.com/reference/_media/test-and-measurement/analog-discovery-3/oscilloscope-splashscreen.png)

---

### ⚙️ DSP / Signal Flow Concept (Modulation + Routing)

![Image](https://help.apple.com/assets/6838A0A83B536B64C80451A9/6838A0ADE0E4BA939002E92C/en_US/70dacf7351e5207b601562476716b906.png)

![Image](https://beausievers.com/synth/synthbasics/i/fourthflow.png)

![Image](https://www.researchgate.net/publication/375879233/figure/fig3/AS%3A11431281277469192%401726106686807/Audio-processing-for-digital-signal-processing.png)
