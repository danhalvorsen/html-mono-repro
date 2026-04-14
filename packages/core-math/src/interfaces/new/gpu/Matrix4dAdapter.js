import { Matrix4d } from "./matrix4d.js";
export class Matrix4dAdapter {
    constructor(core) {
        this.core = core ? core.clone() : new Matrix4d();
    }
    static unwrap(mat) {
        if (mat instanceof Matrix4dAdapter)
            return mat.core;
        if (mat instanceof Matrix4d)
            return mat;
        throw new Error("IMatrix not backed by Matrix4d");
    }
    multiply(mat) {
        const r = this.core.clone();
        r.multiply(Matrix4dAdapter.unwrap(mat));
        return new Matrix4dAdapter(r);
    }
    add(mat) {
        const r = this.core.clone();
        r.add(Matrix4dAdapter.unwrap(mat));
        return new Matrix4dAdapter(r);
    }
    subtract(mat) {
        const r = this.core.clone();
        r.subtract(Matrix4dAdapter.unwrap(mat));
        return new Matrix4dAdapter(r);
    }
    scale(s) {
        const r = this.core.clone();
        r.scale(s);
        return new Matrix4dAdapter(r);
    }
    transpose() {
        const r = this.core.clone();
        r.transpose();
        return new Matrix4dAdapter(r);
    }
    inverse() {
        const r = this.core.clone();
        return r.inverse() ? new Matrix4dAdapter(r) : null;
    }
    determinant() {
        return this.core.determinant();
    }
    applyToVector(v) {
        const out = v.slice();
        this.core.applyToVector(out);
        return out;
    }
    toFloat32Array() {
        return this.core.toFloat32Array().slice();
    }
    clone() {
        return new Matrix4dAdapter(this.core.clone());
    }
    equals(mat, eps = 1e-6) {
        return this.core.equals(Matrix4dAdapter.unwrap(mat), eps);
    }
    setFrom(mat) {
        const r = this.core.clone();
        r.setFrom(Matrix4dAdapter.unwrap(mat));
        return new Matrix4dAdapter(r);
    }
    setIdentity() {
        this.core.setIdentity();
    }
}
//# sourceMappingURL=Matrix4dAdapter.js.map