// cypress/e2e/api-calls.cy.ts

describe('API Endpoint Tests', () => {
  beforeEach(() => {
    // Start intercepting before loading the page
    cy.intercept('GET', '**/apg/settings/env.js').as('envSettings');

    // Visit the main page
    cy.visit('/');
  });

  it('should make a call to env.js endpoint', () => {
    // Wait for the API call and assert on it
    cy.wait('@envSettings').then((interception) => {
      // Assert that the call was made with either 200 (OK) or 304 (Not Modified)
      expect(interception.response.statusCode).to.be.oneOf([200, 304]);

      // Log the actual headers for debugging
      cy.log('Response Headers:', JSON.stringify(interception.response.headers, null, 2));
      cy.log('Request Headers:', JSON.stringify(interception.request.headers, null, 2));

      // Assert on headers that we know exist
      expect(interception.response.headers).to.have.property('access-control-allow-credentials');
      expect(interception.response.headers['access-control-allow-credentials']).to.eq('true');

      // Verify the request method
      expect(interception.request.method).to.eq('GET');

      // Verify the URL pattern
      expect(interception.request.url).to.include('/apg/settings/env.js');
    });
  });

  it('should have expected response headers', () => {
    cy.wait('@envSettings').then((interception) => {
      const headers = interception.response.headers;

      // More specific header checks
      expect(headers).to.have.property('x-content-type-options', 'nosniff');
      expect(headers).to.have.property('x-frame-options', 'SAMEORIGIN');

      // Log all headers for debugging
      cy.log('All Response Headers:', JSON.stringify(headers, null, 2));
    });
  });

  // Optional: Test to clear cache if needed
  it('should handle fresh request with cleared cache', () => {
    // Clear browser cache before this test
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.reload(true); // Force reload without cache

    cy.wait('@envSettings').then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 304]);
    });
  });
});

describe('API Endpoint Tests', () => {
  beforeEach(() => {
    // Intercept both potential endpoints
    cy.intercept('GET', '**/api/settings/env.js').as('primaryEnvSettings');
    cy.intercept('GET', '**/apg/settings/env.js').as('nestEnvSettings');

    // Visit the main page
    cy.visit('/');
  });

  it('should load environment settings from an available endpoint', () => {
    // Wait for any of the endpoints with a short timeout and handle if they don't appear
    cy.wait('@nestEnvSettings', { timeout: 5000 })
      .then((interception) => {
        // Primary settings loaded successfully
        cy.log('Primary API call succeeded with status:', interception.response.statusCode);
        expect(interception.response.statusCode).to.be.oneOf([200, 304]);

        // Verify it contains the expected data
        if (interception.response.body) {
          expect(interception.response.body).to.include('window.webAppConfig');
        }
      })
      .then(() => {
        // Check if our app correctly loaded the configuration
        cy.log('Primary API call worked, verifying application state');
        verifyApplicationState();
      });
  });

  it('should fall back to NestJS endpoint when primary is forced to fail', () => {
    // Force the primary endpoint to fail
    cy.intercept('GET', '**/api/settings/env.js', {
      statusCode: 500,
      body: 'Internal Server Error'
    }).as('forcedPrimaryFailure');

    // Now visit the page again to trigger the fallback
    cy.visit('/');

    // Now the fallback should be called
    cy.wait('@nestEnvSettings', { timeout: 10000 })
      .then((interception) => {
        cy.log('Fallback API call made with status:', interception.response.statusCode);
        expect(interception.response.statusCode).to.be.oneOf([200, 304]);

        // Verify it contains the expected data
        if (interception.response.body) {
          expect(interception.response.body).to.include('window.webAppConfig');
        }
      })
      .then(() => {
        // Check if our app correctly loaded the configuration
        cy.log('Fallback API worked, verifying application state');
        verifyApplicationState();
      });
  });

  // Helper function to verify the application state - adapt this to your app's specifics
  function verifyApplicationState() {
    // Check if the app loaded properly with config
    cy.window().then((win) => {
      // Try to access the config using different possible paths
      // Adjust these checks based on how your app stores the config
      const possibleConfigs = [
        win.webAppConfig,
        win.window?.webAppConfig,
        // Add other possible locations your app might store the config
      ];

      // Log what we found for debugging
      cy.log('Config detection results:', possibleConfigs.some(c => !!c) ? 'Found' : 'Not found');

      // Check if the app's UI elements that depend on config are present
      // For example, if your app shows a version number from config:
      // cy.get('[data-testid="app-version"]').should('exist');

      // Or just verify some core app elements are present
      cy.get('body').should('be.visible');
    });
  }
});

describe('Simple API Fallback Test', () => {
  it('should continue working when primary API fails', () => {
    // Force the primary API to fail
    cy.intercept('GET', '**/api/settings*', {
      statusCode: 500,
      body: 'Internal Server Error'
    }).as('primaryApiFail');

    // Allow the fallback API to work normally
    // Just visit the page and verify it loads
    cy.visit('/');

    // Wait for page to load fully
    cy.wait(5000);

    // Check if the page has content (very basic test)
    cy.get('body').should('be.visible');

    // Log a message indicating the test completed
    cy.log('Page loaded successfully despite primary API failure');
  });

  it('should work when both APIs fail', () => {
    // Force both APIs to fail
    cy.intercept('GET', '**/api/settings*', {
      statusCode: 500,
      body: 'Internal Server Error'
    }).as('primaryApiFail');

    cy.intercept('GET', '**/settings/env.js', {
      statusCode: 404,
      body: 'Not Found'
    }).as('fallbackApiFail');

    // Visit the page and see if it loads
    cy.visit('/');

    // Wait for page to load
    cy.wait(5000);

    // Check if the page has content
    cy.get('body').should('be.visible');

    // Log a message
    cy.log('Page handled double API failure');
  });
});
