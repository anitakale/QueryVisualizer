// Copyright (c) Bentley Systems

// eslint-disable-next-line @typescript-eslint/no-var-requires
const loadDefaultConfig = require('../../eslintdefault');
const additionalRules = {
}
module.exports = loadDefaultConfig(__dirname, true, additionalRules);
