import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    setupNodeEvents(on, config) {
      // modify config values using bracket notation
      config['baseUrl'] = config.env['baseUrl'] || config['baseUrl'];
      return config;
    },
    env: {
      environment: 'local',
      baseUrl: process.env['CYPRESS_BASE_URL'] || 'http://localhost:4200'
    }
  }
});
