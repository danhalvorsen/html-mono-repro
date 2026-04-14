export const vector3HermiteFn = (seg, t) => {
    const t2 = t * t;
    const t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    return seg.p0.multiplyScalar(h00)
        .add(seg.m0.multiplyScalar(h10))
        .add(seg.p1.multiplyScalar(h01))
        .add(seg.m1.multiplyScalar(h11));
};
//# sourceMappingURL=vector3HermiteFn.js.map