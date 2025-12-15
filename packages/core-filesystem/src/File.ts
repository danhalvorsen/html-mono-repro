import fs from 'fs';
import { Path } from './Path.js';

export class File {
    constructor(public readonly path: Path) { }

    read(): string {
        return fs.readFileSync(this.path.full, 'utf-8');
    }

    write(content: string): void {
        fs.writeFileSync(this.path.full, content, 'utf-8');
    }

    delete(): void {
        fs.unlinkSync(this.path.full);
    }

    exists(): boolean {
        return this.path.exists();
    }
}
