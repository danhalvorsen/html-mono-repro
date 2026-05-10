import {
  ApiMessageKind,
  type ApiCatalog,
} from "../domain/ApiCatalog.js";

export interface IApiCatalogProvider {
  getCatalog(): ApiCatalog;
}

export class StaticApiCatalogProvider implements IApiCatalogProvider {
  public getCatalog(): ApiCatalog {
    return {
      serviceName: "training-image-api",
      schemaVersion: 1,
      endpoints: [
        {
          method: "POST",
          path: "/api/command",
          description: "Executes command messages. The request body must contain a supported command type.",
        },
        {
          method: "POST",
          path: "/api/query",
          description: "Executes query messages. The request body must contain a supported query type.",
        },
      ],
      commands: [
        {
          type: "GenerateTrainingImages",
          kind: ApiMessageKind.Command,
          endpoint: "/api/command",
          description: "Generates rotated and formatted training-image variants for one selected SVG source item.",
          fields: [
            {
              name: "type",
              required: true,
              type: '"GenerateTrainingImages"',
              description: "Command discriminator.",
            },
            {
              name: "selection.category",
              required: true,
              type: "string",
              description: "Source category, for example 'valves'.",
            },
            {
              name: "selection.categoryItem",
              required: true,
              type: "string",
              description: "Fully qualified category item using '{category}.{item-name}', for example 'valves.ball-valve'.",
            },
            {
              name: "config.sourceDirectory",
              required: true,
              type: "string",
              description: "Directory containing source SVG files.",
            },
            {
              name: "config.outputDirectory",
              required: true,
              type: "string",
              description: "Directory where generated files are written.",
            },
            {
              name: "config.outputFormats",
              required: true,
              type: "readonly string[]",
              description: "Output formats. Current implementation supports 'svg' and 'png'.",
            },
            {
              name: "config.rotation.angleStepDegrees",
              required: true,
              type: "number",
              description: "Rotation step. Must divide 360 exactly, for example 36.",
            },
            {
              name: "config.rotation.includeOriginal",
              required: true,
              type: "boolean",
              description: "Whether the non-rotated source variant is included.",
            },
            {
              name: "config.noise",
              required: true,
              type: "object",
              description: "Noise strategy configuration.",
            },
          ],
          exampleRequestBody: {
            type: "GenerateTrainingImages",
            selection: {
              category: "valves",
              categoryItem: "valves.ball-valve",
            },
            config: {
              sourceDirectory: "../read-xml-create-svg/generated/svgs",
              outputDirectory: "./generated/training-images",
              outputFormats: ["svg", "png"],
              rotation: {
                angleStepDegrees: 36,
                includeOriginal: true,
              },
              noise: {
                enabled: false,
                strategies: [],
              },
            },
          },
        },
      ],
      queries: [
        {
          type: "ListSvgFiles",
          kind: ApiMessageKind.Query,
          endpoint: "/api/query",
          description: "Returns source SVG files and parsed metadata.",
          fields: [
            {
              name: "type",
              required: true,
              type: '"ListSvgFiles"',
              description: "Query discriminator.",
            },
            {
              name: "sourceDirectory",
              required: true,
              type: "string",
              description: "Directory containing source SVG files.",
            },
          ],
          exampleRequestBody: {
            type: "ListSvgFiles",
            sourceDirectory: "../read-xml-create-svg/generated/svgs",
          },
        },
        {
          type: "GetGenerationStatus",
          kind: ApiMessageKind.Query,
          endpoint: "/api/query",
          description: "Returns current or last generation status.",
          fields: [
            {
              name: "type",
              required: true,
              type: '"GetGenerationStatus"',
              description: "Query discriminator.",
            },
          ],
          exampleRequestBody: {
            type: "GetGenerationStatus",
          },
        },
        {
          type: "GetApiCatalog",
          kind: ApiMessageKind.Query,
          endpoint: "/api/query",
          description: "Returns supported commands, queries, endpoints, required fields, and request examples.",
          fields: [
            {
              name: "type",
              required: true,
              type: '"GetApiCatalog"',
              description: "Query discriminator.",
            },
          ],
          exampleRequestBody: {
            type: "GetApiCatalog",
          },
        },
      ],
    };
  }
}