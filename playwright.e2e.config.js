const { defineConfig } = require('@playwright/test');
const baseConfig = require('./playwright.config.js');

module.exports = defineConfig({
  ...baseConfig,
  webServer: undefined, // Skip starting the server
});
