import fs from 'fs';
import path from 'path';

export class Path {
    constructor(public readonly full: string) { }

    static from(...segments: string[]): Path {
        return new Path(path.resolve(...segments));
    }

    join(...segments: string[]): Path {
        return new Path(path.join(this.full, ...segments));
    }

    get basename(): string {
        return path.basename(this.full);
    }

    get extension(): string {
        return path.extname(this.full);
    }

    get parent(): Path {
        return new Path(path.dirname(this.full));
    }

    exists(): boolean {
        return fs.existsSync(this.full);
    }
}
