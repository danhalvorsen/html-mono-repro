const fs = require('fs');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'schemas', 'tsconfig.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

function validateTsconfigObj(obj) {
  const valid = validate(obj);
  return { valid: !!valid, errors: validate.errors || [] };
}

function validateFile(filePath) {
  if (!fs.existsSync(filePath)) return { valid: false, errors: [{ message: 'file not found', file: filePath }] };
  const obj = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return validateTsconfigObj(obj);
}

module.exports = { validateTsconfigObj, validateFile };
