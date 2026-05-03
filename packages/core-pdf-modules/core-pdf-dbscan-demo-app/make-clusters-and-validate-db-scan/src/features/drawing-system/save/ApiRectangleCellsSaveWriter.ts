import type { IRectangleCellsSaveWriter } from "./IRectangleCellsSaveWriter.js";

export class ApiRectangleCellsSaveWriter implements IRectangleCellsSaveWriter {
    private readonly endpoint: string;

    public constructor(endpoint: string = "/api/save-rectangle-cells") {
        this.endpoint = endpoint;
    }

    public async writeJson(fileName: string, json: string): Promise<void> {
        const response = await fetch(this.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fileName,
                json
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to save rectangle cells JSON. Status: ${response.status}.`);
        }
    }
}
