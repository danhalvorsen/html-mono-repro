#!/usr/bin/env node
const path = require('path');
const { computeXorFingerprintFromFile } = require('../src/index');

const fp = computeXorFingerprintFromFile(process.argv[2] || path.join(__dirname, '..', '..', 'tsconfig.base.json'));
console.log(fp);
