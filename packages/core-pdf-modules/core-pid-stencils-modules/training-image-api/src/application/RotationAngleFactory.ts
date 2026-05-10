export class RotationAngleFactory {
  public create(angleStepDegrees: number, includeOriginal: boolean): readonly number[] {
    if (!Number.isInteger(angleStepDegrees) || angleStepDegrees <= 0 || angleStepDegrees >= 360) {
      throw new Error("rotation.angleStepDegrees must be an integer between 1 and 359.");
    }

    if (360 % angleStepDegrees !== 0) {
      throw new Error("rotation.angleStepDegrees must divide 360 exactly.");
    }

    const angles: number[] = [];

    if (includeOriginal) {
      angles.push(0);
    }

    for (let angle = angleStepDegrees; angle < 360; angle += angleStepDegrees) {
      angles.push(angle);
    }

    return angles;
  }
}