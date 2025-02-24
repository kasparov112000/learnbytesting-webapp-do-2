import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'https://app.learnbytesting.ai',
    setupNodeEvents(on, config) {
      // Use bracket notation to access properties
      config['baseUrl'] = config.env['baseUrl'] || config['baseUrl'];
      return config;
    },
    env: {
      environment: 'production',
      baseUrl: 'https://app.learnbytesting.ai'
    }
  }
});
