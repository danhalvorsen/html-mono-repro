#!/usr/bin/env node
const path = require('path');
const { validateFile } = require('../src/tsconfig-validator');
const { createTemplate } = require('../src/template-adapter');

const tpl = createTemplate();
const argv = process.argv.slice(2);
if (argv.length === 0) {
  console.error(tpl.error('Usage: validate-tsconfig.js <path/to/tsconfig.json>'));
  process.exit(2);
}

const file = path.resolve(process.cwd(), argv[0]);
const res = validateFile(file);
if (res.valid) {
  console.log(tpl.success('tsconfig validation: OK'));
  process.exit(0);
} else {
  console.error(tpl.error('tsconfig validation: FAILED'));
  const formatted = tpl.formatAjvErrors(res.errors);
  if (formatted) console.error(formatted);
  process.exit(1);
}
