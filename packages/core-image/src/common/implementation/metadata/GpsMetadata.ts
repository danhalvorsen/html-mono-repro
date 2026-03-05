import type { IGpsMetadata } from "../Image.Common.js";
import { LatitudeRef, LongitudeRef } from "./GpsCoordinate.js";


export class GpsMetadata implements IGpsMetadata {
    constructor(
        public readonly lat: number,
        public readonly lon: number,
        public readonly alt?: number
    ) {
        if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new RangeError("lat must be [-90..90]");
        if (!Number.isFinite(lon) || lon < -180 || lon > 180) throw new RangeError("lon must be [-180..180]");
        if (alt !== undefined && !Number.isFinite(alt)) throw new RangeError("alt must be finite if provided");
    }

    static fromDecimalDegrees(lat: number, lon: number, alt?: number): GpsMetadata {
        return new GpsMetadata(lat, lon, alt);
    }

    /** Useful for EXIF-style refs */
    get latRef(): LatitudeRef {
        return this.lat >= 0 ? "N" : "S";
    }

    get lonRef(): LongitudeRef {
        return this.lon >= 0 ? "E" : "W";
    }
}
