// Applications/app-core-math-colors-samples/src/samples/sunriseWarmGradient.ts

import {
  Color,
  Gradient,
  GradientStop,
} from "@monorepo/core-math-colors";

export const sunriseWarmGradient = Gradient.create([
  GradientStop.create(
    0,
    Color.fromNormalized(1, 0.9529, 0.8784, 1),
  ),
  GradientStop.create(
    0.2,
    Color.fromNormalized(1, 0.8471, 0.6588, 1),
  ),
  GradientStop.create(
    0.4,
    Color.fromNormalized(1, 0.7059, 0.6353, 1),
  ),
  GradientStop.create(
    0.6,
    Color.fromNormalized(0.898, 0.5961, 0.6078, 1),
  ),
  GradientStop.create(
    0.8,
    Color.fromNormalized(0.7098, 0.5137, 0.5529, 1),
  ),
  GradientStop.create(
    1,
    Color.fromNormalized(0.4275, 0.4078, 0.4588, 1),
  ),
]);