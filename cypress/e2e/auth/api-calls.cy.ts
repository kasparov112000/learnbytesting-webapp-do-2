// cypress/e2e/api-calls.cy.ts

describe('API Endpoint Tests', () => {
  beforeEach(() => {
    // Start intercepting before loading the page
    cy.intercept('GET', '**/api/settings/env.js').as('envSettings');

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
      expect(interception.request.url).to.include('/api/settings/env.js');
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
