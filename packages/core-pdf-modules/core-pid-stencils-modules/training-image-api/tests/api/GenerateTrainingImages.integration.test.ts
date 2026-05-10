import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  type ApiEnvelope,
  ExpressApiTestFixture,
  type GenerationCommandResult,
} from "./ExpressApiTestFixture.js";

describe("API command: GenerateTrainingImages", () => {
  let fixture: ExpressApiTestFixture;
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    fixture = new ExpressApiTestFixture();
    await fixture.initialize();

    await new Promise<void>((resolve) => {
      server = fixture.createApp().listen(0, "127.0.0.1", () => {
        resolve();
      });
    });

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    await fixture.dispose();
  });

  it("should generate selected training image files from POST /api/command", async () => {
    await fixture.createSourceSvgFile();

    const response = await request(baseUrl)
      .post("/api/command")
      .send(fixture.createGenerateCommandBody(["svg"]) as object)
      .expect(200);

    const envelope = response.body as ApiEnvelope<GenerationCommandResult>;

    expect(envelope.ok).toBe(true);
    expect(envelope.data?.status.sourceFiles).toBe(1);
    expect(envelope.data?.status.generatedFiles).toBe(2);
    expect(envelope.data?.status.errors).toHaveLength(0);

    expect(
      fixture.generatedFileExists("valves/ball-valve/ball-valve.svg"),
    ).toBe(true);

    expect(
      fixture.generatedFileExists("valves/ball-valve/ball-valve-180.svg"),
    ).toBe(true);
  });

  it("should return 400 when required selection is missing", async () => {
    const response = await request(baseUrl)
      .post("/api/command")
      .send({
        type: "GenerateTrainingImages",
        config: {
          sourceDirectory: fixture.sourceDirectory,
          outputDirectory: fixture.outputDirectory,
          outputFormats: ["svg"],
          rotation: {
            angleStepDegrees: 180,
            includeOriginal: true,
          },
          noise: {
            enabled: false,
            strategies: [],
          },
        },
      })
      .expect(400);

    const envelope = response.body as ApiEnvelope<unknown>;

    expect(envelope.ok).toBe(false);
    expect(envelope.error).toContain("selection");
  });

  it("should return 400 for unsupported command message type", async () => {
    const response = await request(baseUrl)
      .post("/api/command")
      .send({
        type: "UnknownCommand",
      })
      .expect(400);

    const envelope = response.body as ApiEnvelope<unknown>;

    expect(envelope.ok).toBe(false);
    expect(envelope.error).toContain("Unsupported command type");
  });
});