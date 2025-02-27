import { TestBed } from '@angular/core/testing';
import { TestScheduler } from 'rxjs/testing';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { OverlayContainer } from '@angular/cdk/overlay';

import {
  AppState,
  LocalStorageService,
  TitleService,
  AnimationsService
} from '../core.module';

import { SettingsEffects, SETTINGS_KEY } from './settings.effects';
import { SettingsState } from './settings.model';
import { SettingService } from './setting.service';
import { actionSettingsChangeTheme, loadSettings, loadSettingsSuccess } from './settings.actions';
import { selectSettingsState } from '../core.state';

interface MockClassList {
  add: jasmine.Spy;
  remove: jasmine.Spy;
  item: jasmine.Spy;
  contains: jasmine.Spy;
  toggle: jasmine.Spy;
  replace: jasmine.Spy;
  supports: jasmine.Spy;
  value: string;
  length: number;
  forEach: jasmine.Spy;
  entries: jasmine.Spy;
  keys: jasmine.Spy;
  values: jasmine.Spy;
  [Symbol.iterator](): IterableIterator<string>;
}

class MockHTMLElement {
  classList: MockClassList;

  constructor() {
    this.classList = {
      add: jasmine.createSpy('add'),
      remove: jasmine.createSpy('remove'),
      item: jasmine.createSpy('item'),
      contains: jasmine.createSpy('contains'),
      toggle: jasmine.createSpy('toggle'),
      replace: jasmine.createSpy('replace'),
      supports: jasmine.createSpy('supports'),
      value: '',
      length: 0,
      forEach: jasmine.createSpy('forEach'),
      entries: jasmine.createSpy('entries').and.returnValue([]),
      keys: jasmine.createSpy('keys').and.returnValue([]),
      values: jasmine.createSpy('values').and.returnValue([]),
      [Symbol.iterator]: function* () { yield* []; }
    };
  }
}

describe('SettingsEffects', () => {
  let effects: SettingsEffects;
  let actions$: BehaviorSubject<any>;
  let settingService: jasmine.SpyObj<SettingService>;
  let localStorageService: jasmine.SpyObj<LocalStorageService>;
  let titleService: jasmine.SpyObj<TitleService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let router: jasmine.SpyObj<Router>;
  let overlayContainer: jasmine.SpyObj<OverlayContainer>;
  let animationsService: jasmine.SpyObj<AnimationsService>;
  let scheduler: TestScheduler;

  const mockSettings = JSON.stringify({
    language: 'en',
    pageAnimations: true,
    elementsAnimations: true,
    theme: 'dark',
    nightTheme: 'dark',
    autoNightMode: false,
    stickyHeader: false,
    pageAnimationsDisabled: false,
    hour: 12
  });

  const initialState = {
    settings: {
      language: 'en',
      pageAnimations: true,
      elementsAnimations: true,
      theme: 'default',
      nightTheme: 'default',
      autoNightMode: false,
      stickyHeader: false,
      pageAnimationsDisabled: true,
      hour: 12,
      loadSettings: {}
    }
  };

  beforeEach(() => {
    actions$ = new BehaviorSubject({});
    settingService = jasmine.createSpyObj('SettingService', ['getSettings']);
    localStorageService = jasmine.createSpyObj('LocalStorageService', ['setItem']);
    titleService = jasmine.createSpyObj('TitleService', ['setTitle']);
    translateService = jasmine.createSpyObj('TranslateService', {
      use: jasmine.createSpy('use').and.returnValue(of('en'))
    });
    router = jasmine.createSpyObj('Router', [], {
      routerState: {
        snapshot: {}
      },
      events: new BehaviorSubject({})
    });
    overlayContainer = jasmine.createSpyObj('OverlayContainer', ['getContainerElement']);
    animationsService = jasmine.createSpyObj('AnimationsService', ['updateRouteAnimationType']);

    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    overlayContainer.getContainerElement.and.returnValue(new MockHTMLElement() as unknown as HTMLElement);

    TestBed.configureTestingModule({
      providers: [
        SettingsEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          initialState,
          selectors: [
            { selector: selectSettingsState, value: initialState.settings }
          ]
        }),
        { provide: SettingService, useValue: settingService },
        { provide: LocalStorageService, useValue: localStorageService },
        { provide: TitleService, useValue: titleService },
        { provide: TranslateService, useValue: translateService },
        { provide: Router, useValue: router },
        { provide: OverlayContainer, useValue: overlayContainer },
        { provide: AnimationsService, useValue: animationsService }
      ]
    });

    effects = TestBed.inject(SettingsEffects);
  });

  it('should call methods on LocalStorageService for PERSIST action', (done) => {
    scheduler.run(() => {
      // Dispatch the theme change action
      actions$.next(actionSettingsChangeTheme({ theme: 'dark' }));

      effects.persistSettings.subscribe(() => {
        expect(localStorageService.setItem).toHaveBeenCalledWith(
          SETTINGS_KEY,
          initialState.settings
        );
        done();
      });
    });
  });

  it('should dispatch loadSettingsSuccess action on successful API call', (done) => {
    // Arrange
    settingService.getSettings.and.returnValue(of(mockSettings));
    actions$.next(loadSettings());

    // Act
    effects.loadSettings$.subscribe(action => {
      // Assert
      expect(action).toEqual(
        loadSettingsSuccess({ settings: mockSettings })
      );
      expect(settingService.getSettings).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('should log response details when API call is successful', (done) => {
    // Arrange
    settingService.getSettings.and.returnValue(of(mockSettings));
    spyOn(console, 'log');
    actions$.next(loadSettings());

    // Act
    effects.loadSettings$.subscribe(() => {
      // Assert
      expect(console.log).toHaveBeenCalledWith('Raw response:', mockSettings);
      expect(console.log).toHaveBeenCalledWith('Response type:', 'string');
      done();
    });
  });

  // Updated test cases for the modified loadSettings$ effect

it('should log error details when API call fails and fallback also fails', (done) => {
  // Arrange
  const nodeError = new HttpErrorResponse({
    error: 'Node orchestrator error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'api/settings'
  });

  const nestError = new HttpErrorResponse({
    error: 'Nest orchestrator error',
    status: 404,
    statusText: 'Not Found',
    url: 'nest/settings/env.js'
  });

  // Mock the original service call to fail
  settingService.getSettings.and.returnValue(throwError(() => nodeError));

  // Mock the fallback service call to also fail
  settingService.getSettingsFromNest = jasmine.createSpy().and.returnValue(
    throwError(() => nestError)
  );

  // Spy on console.error to verify logs
  spyOn(console, 'error');

  // Dispatch the action
  actions$.next(loadSettings());

  // Act & Assert
  effects.loadSettings$.subscribe(action => {
    // Verify the Node.js error was logged
    expect(console.error).toHaveBeenCalledWith('Node Orchestrator Error:', {
      status: 500,
      message: nodeError.message,
      url: 'api/settings',
    });

    // Verify the Nest.js error was logged
    expect(console.error).toHaveBeenCalledWith('Nest.js Orchestrator Error:', {
      status: 404,
      message: nestError.message,
      url: 'nest/settings/env.js',
    });

    // Verify the correct error action was dispatched
    expect(action).toEqual({
      type: '[Settings] Load Settings Failure',
      error: nestError
    });

    done();
  });
});

// Updated test cases for the modified loadSettings$ effect

it('should log error details when API call fails and fallback also fails', (done) => {
  // Arrange
  const nodeError = new HttpErrorResponse({
    error: 'Node orchestrator error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'api/settings'
  });

  const nestError = new HttpErrorResponse({
    error: 'Nest orchestrator error',
    status: 404,
    statusText: 'Not Found',
    url: 'nest/settings/env.js'
  });

  // Mock the original service call to fail
  settingService.getSettings.and.returnValue(throwError(() => nodeError));

  // Mock the fallback service call to also fail
  settingService.getSettingsFromNest = jasmine.createSpy().and.returnValue(
    throwError(() => nestError)
  );

  // Spy on console.error to verify logs
  spyOn(console, 'error');

  // Dispatch the action
  actions$.next(loadSettings());

  // Act & Assert
  effects.loadSettings$.subscribe(action => {
    // Verify the Node.js error was logged
    expect(console.error).toHaveBeenCalledWith('Node Orchestrator Error:', {
      status: 500,
      message: nodeError.message,
      url: 'api/settings',
    });

    // Verify the Nest.js error was logged
    expect(console.error).toHaveBeenCalledWith('Nest.js Orchestrator Error:', {
      status: 404,
      message: nestError.message,
      url: 'nest/settings/env.js',
    });

    // Verify the correct error action was dispatched
    expect(action).toEqual({
      type: '[Settings] Load Settings Failure',
      error: nestError
    });

    done();
  });
});

// Updated test cases for the modified loadSettings$ effect

it('should log error details when API call fails and fallback also fails', (done) => {
  // Arrange
  const nodeError = new HttpErrorResponse({
    error: 'Node orchestrator error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'api/settings'
  });

  const nestError = new HttpErrorResponse({
    error: 'Nest orchestrator error',
    status: 404,
    statusText: 'Not Found',
    url: 'nest/settings/env.js'
  });

  // Mock the original service call to fail
  settingService.getSettings.and.returnValue(throwError(() => nodeError));

  // Mock the fallback service call to also fail
  settingService.getSettingsFromNest = jasmine.createSpy().and.returnValue(
    throwError(() => nestError)
  );

  // Spy on console.error to verify logs
  spyOn(console, 'error');

  // Dispatch the action
  actions$.next(loadSettings());

  // Act & Assert
  effects.loadSettings$.subscribe(action => {
    // Verify the Node.js error was logged
    expect(console.error).toHaveBeenCalledWith('Node Orchestrator Error:', {
      status: 500,
      message: nodeError.message,
      url: 'api/settings',
    });

    // Verify the Nest.js error was logged
    expect(console.error).toHaveBeenCalledWith('Nest.js Orchestrator Error:', {
      status: 404,
      message: nestError.message,
      url: 'nest/settings/env.js',
    });

    // Verify the correct error action was dispatched
    expect(action).toEqual({
      type: '[Settings] Load Settings Failure',
      error: nestError
    });

    done();
  });
});

it('should dispatch success action on fallback success when primary API fails', (done) => {
  // Arrange
  const nodeError = new HttpErrorResponse({
    error: 'Node orchestrator error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'api/settings'
  });

  const fallbackSettings = { version: '1.0.0', apiUrl: 'http://localhost:3700' };

  // Mock the original service call to fail
  settingService.getSettings.and.returnValue(throwError(() => nodeError));

  // Mock the fallback service call to succeed
  settingService.getSettingsFromNest = jasmine.createSpy().and.returnValue(
    of('window.webAppConfig = {"version":"1.0.0","apiUrl":"http://localhost:3700"};')
  );

  // Spy on console.error and console.log
  spyOn(console, 'error');
  spyOn(console, 'log');

  // Dispatch the action
  actions$.next(loadSettings());

  // Act & Assert
  effects.loadSettings$.subscribe(action => {
    // Verify the Node.js error was logged
    expect(console.error).toHaveBeenCalledWith('Node Orchestrator Error:', {
      status: 500,
      message: nodeError.message,
      url: 'api/settings',
    });

    // Verify fallback was logged
    expect(console.log).toHaveBeenCalledWith('Fallback to Nest.js:', 'window.webAppConfig = {"version":"1.0.0","apiUrl":"http://localhost:3700"};');

    // Verify the success action was dispatched with fallback data
    expect(action).toEqual(
      loadSettingsSuccess({ settings: 'window.webAppConfig = {"version":"1.0.0","apiUrl":"http://localhost:3700"};' })
    );

    done();
  });
});

it('should dispatch error action when both primary and fallback APIs fail', (done) => {
  // Arrange
  const nodeError = new HttpErrorResponse({
    error: 'Node orchestrator error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'api/settings'
  });

  const nestError = new HttpErrorResponse({
    error: 'Nest orchestrator error',
    status: 404,
    statusText: 'Not Found',
    url: 'nest/settings/env.js'
  });

  // Mock the original service call to fail
  settingService.getSettings.and.returnValue(throwError(() => nodeError));

  // Mock the fallback service call to also fail
  settingService.getSettingsFromNest = jasmine.createSpy().and.returnValue(
    throwError(() => nestError)
  );

  // Dispatch the action
  actions$.next(loadSettings());

  // Act & Assert
  effects.loadSettings$.subscribe(action => {
    // Verify the correct error action was dispatched with the Nest error
    expect(action).toEqual({
      type: '[Settings] Load Settings Failure',
      error: nestError
    });

    // Verify both service methods were called
    expect(settingService.getSettings).toHaveBeenCalledTimes(1);
    expect(settingService.getSettingsFromNest).toHaveBeenCalledTimes(1);

    done();
  });
});


});
