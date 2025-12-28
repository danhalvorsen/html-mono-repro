import { strict as assert } from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { TemplateFormatter } from "@my-graphics/core-formatter";
import { ValidationTemplate, Messages } from "@my-graphics/core-template";
import { ValidationResult } from "@my-graphics/core-specifications";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templateFormatter = new TemplateFormatter({
  sanitize: (value) => value.trimEnd(),
});
const statusTemplate = new ValidationTemplate("[${status}] ${name}${detail}");
const errorTemplate = new ValidationTemplate("[${path}] ${message}");

function logStatus(status, name, detail = "") {
  const detailSuffix = detail ? ` - ${detail}` : "";
  console.log(templateFormatter.format({ status, name, detail: detailSuffix }, statusTemplate));
}

function loadJson(...segments) {
  const filePath = path.resolve(__dirname, ...segments);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    throw new Error(Messages.unparsableJson(filePath, err?.message ?? "unknown"));
  }
}

function formatErrors(errors) {
  if (!errors || errors.length === 0) return [];
  return errors.map((error) => {
    const instancePath = error.instancePath || error.schemaPath || "/";
    const message = error.message || "schema violation";
    return templateFormatter.format({ path: instancePath, message }, errorTemplate);
  });
}

function createTsconfigValidator() {
  const schema = loadJson("..", "schemas", "tsconfig-rules.schema.json");
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  return (obj) => {
    const valid = validate(obj);
    if (valid) {
      return ValidationResult.ok();
    }
    const formatted = formatErrors(validate.errors);
    return ValidationResult.fail(
      formatted.length ? formatted : ["tsconfig validation failed"]
    );
  };
}

const schema = loadJson("..", "schemas", "tsconfig-rules.schema.json");
const schemaAjv = new Ajv({ allErrors: true, strict: false });
addFormats(schemaAjv);
const schemaValidator = schemaAjv.compile(schema);
const rulesFile = loadJson("..", "rules", "tsconfig-rules.json");

const tests = [
  {
    name: "tsconfig rule document matches schema",
    run: () => {
      const passed = schemaValidator(rulesFile);
      if (!passed) {
        throw new Error(formatErrors(schemaValidator.errors).join("\n"));
      }
    },
  },
  {
    name: "valid fixture passes validator",
    run: () => {
      const validTsconfig = loadJson("./fixtures/good-tsconfig.json");
      const validator = createTsconfigValidator();
      const result = validator(validTsconfig);
      assert(result.isSuccess, result.errors.join("\n"));
    },
  },
  {
    name: "invalid fixture fails validator",
    run: () => {
      const invalidTsconfig = loadJson("./fixtures/bad-tsconfig.json");
      const validator = createTsconfigValidator();
      const result = validator(invalidTsconfig);
      assert(!result.isSuccess, "Expected failure for fixture");
      assert(result.errors.length > 0, "Expected at least one validation error");
      assert(
        result.errors.some((error) => error.includes("required property")),
        `unexpected errors: ${result.errors.join(" | ")}`
      );
    },
  },
];

let failures = 0;
for (const test of tests) {
  try {
    test.run();
    logStatus("PASS", test.name);
  } catch (error) {
    failures += 1;
    logStatus("FAIL", test.name, error?.message ?? "unknown");
  }
}

if (failures > 0) {
  process.exit(1);
}
