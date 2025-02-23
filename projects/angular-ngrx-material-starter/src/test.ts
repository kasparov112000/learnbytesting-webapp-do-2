// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }
);

// Import all test files
const TEST_FILES = [
  './app/core/notifications/notification.service.spec.ts',
  './app/core/google-analytics/google-analytics.effects.spec.ts',
  // Add other spec files here
];

TEST_FILES.forEach(file => import(file));
