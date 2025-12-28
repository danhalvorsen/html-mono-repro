Below is your text rewritten into a **clear, formal, specification-style document**, without changing intent or technical meaning. Ambiguities are resolved, terminology is normalized, and responsibilities are stated explicitly.

---

# Technical Specification: Probabilistic Image Collage with Continuous Camera Navigation

## 1. Purpose

The purpose of this system is to generate a dynamic visual collage from a collection of images, using **metadata-only processing**, **probabilistic selection**, **GPU-efficient rendering**, and **continuous camera motion**. The system emphasizes fairness of exposure across people detected in images, visual consistency via color transfer, and optimal GPU memory usage.

---

## 2. Fundamental Constraints

### 2.1 Image Data Usage

* Image pixel data must **not** be processed directly for collage composition.
* Only precomputed or externally provided properties are permitted:

  * Image width and height
  * Detected people in the image
  * Capture year
  * Color transfer metadata required for visual consistency
* All pixel-level transformations must be executed on the GPU.

### 2.2 Rendering Platform

* Rendering must be implemented using **Three.js**.
* All textures must use **power-of-two (POT)** dimensions to ensure optimal GPU memory alignment.

---

## 3. Modular Architecture Requirements

The system must be decomposed into clearly defined, independent modules. Each module must follow **Single Responsibility**, be **open for extension and closed for modification**, and communicate exclusively through interfaces.

### 3.1 Lightroom Integration Module

**Responsibility:**
Query Adobe Lightroom for image metadata.

**Inputs:**

* Target list of people
* Year distribution function
* Face-count distribution function

**Outputs:**

* A collection of image descriptors containing metadata only

No rendering, probability evaluation, or layout logic is permitted in this module.

---

### 3.2 Image Property Evaluation Module

**Responsibility:**
Attach derived properties to images.

**Responsibilities include:**

* Associating detected people with each image
* Assigning year metadata
* Providing color transfer statistics (mean and standard deviation in LAB color space)

This module must not allocate textures or perform rendering.

---

### 3.3 Collage Layout Model

The collage layout is defined as a **logical model**, not a rendering construct.

**Requirements:**

* Each image retains its original aspect ratio
* Layout size is defined using a scale abstraction:

  * A base ratio (e.g., 16:9 or custom)
  * A scalar multiplier
* Scaling must be deterministic and independent of rendering resolution

This module produces **layout intent only**, not GPU resources.

---

### 3.4 Texture Allocation Module

**Responsibility:**
Convert logical layout sizes into GPU-optimized texture dimensions.

**Rules:**

* Texture dimensions must be powers of two (2, 4, 8, 16, 32, 64, 128, etc.)
* Texture size selection must be influenced by:

  * Image importance
  * Distribution fairness across people
* Overrepresented individuals must be penalized probabilistically, not excluded

The output of this module is a texture allocation plan, not actual texture loading.

---

### 3.5 Color Consistency and Transfer Module

**Responsibility:**
Ensure visual consistency across images using Reinhard color transfer.

**Implementation Constraints:**

* LAB mean and standard deviation must be computed **once per image on the CPU**
* GPU shaders must apply the Reinhard transformation using uniforms
* No per-frame or per-pixel statistical computation is allowed on the CPU

**Formula applied in shader:**

```
(labColor − sourceMean) × (targetStdDev / sourceStdDev) + targetMean
```

---

### 3.6 Collage Surface Definition

* The collage must be rendered on a **single rectangular surface**
* Image placement must be handled via **UV (s, t) coordinates**
* No per-image geometry is allowed
* The system may use:

  * A texture atlas, or
  * A texture array, or
  * Individually bound textures (final decision deferred)

---

## 4. Camera and Navigation System

### 4.1 Camera Behavior

* The camera starts at the center of the initial image
* The camera moves continuously from image to image
* Motion must be smooth and uninterrupted
* The system runs until the **ESC** key is pressed

### 4.2 Camera Strategy

Camera movement must be controlled by a strategy abstraction defining:

* How the next target image is selected
* How the camera transitions between targets

### 4.3 Probabilistic Target Selection

* Selection probability depends on:

  * Image metadata
  * People present in the image
  * Historical exposure of those people
* Recently exposed individuals must have reduced probability of re-selection
* Probability reduction must follow a smooth decay curve
* The system must converge toward balanced exposure over time

No hard exclusions or deterministic cycles are permitted.

---

## 5. Randomness and Determinism

* All randomness must be **controlled and reproducible**
* Random selection must always be guided by probability distributions
* No ad-hoc or unbounded random choices are allowed

---

## 6. Termination Conditions

* The system runs indefinitely
* Execution stops only when the user presses the **ESC** key

---

## 7. Explicit Non-Goals

The following are explicitly out of scope:

* CPU-side image composition
* ECS frameworks
* Monolithic rendering logic
* Magic constants or implicit behavior
* Frame-dependent probability recalculation on the CPU

---

If you want, the next step can be:

* **Interface-only definitions**, or
* **Formal probability model specification**, or
* **Camera strategy abstractions**

Say which one to proceed with.
