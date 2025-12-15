import * as THREE from "three";
import { IFieldInfluence } from "./influences/IFieldInfluence.js";
import { NoiseInfluence } from "./influences/NoiseInfluence.js";
import { CurlInfluence } from "./influences/CurlInfluence.js";
import { GradientInfluence } from "./influences/GradientInfluence.js";
import { LineSegmentBuilder } from "./LineSegmentBuilder.js";

export class VectorField {
    private influences: IFieldInfluence[] = [];

    noise(scale = 0.4, zStrength = 0.2): this {
        this.influences.push(new NoiseInfluence(scale, zStrength));
        return this;
    }

    withCurl(strength = 1.0): this {
        this.influences.push(new CurlInfluence(strength));
        return this;
    }

    withGradient(target: THREE.Vector3, strength = 1.0): this {
        this.influences.push(new GradientInfluence(target, strength));
        return this;
    }

    LineSegment(width = 1, life = 20, color = 0xffffff): LineSegmentBuilder {
        return new LineSegmentBuilder(this)
            .width(width)
            .segmentLength(life)
            .color(color);
    }

    sample(x: number, y: number, z: number): THREE.Vector3 {
        const v = new THREE.Vector3();
        for (const inf of this.influences) v.add(inf.sample(x, y, z));
        return v;
    }

    done(): this { return this; }
}
