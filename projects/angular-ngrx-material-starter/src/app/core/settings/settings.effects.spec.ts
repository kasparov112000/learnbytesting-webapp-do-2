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

  it('should dispatch error action on API failure', (done) => {
    // Arrange
    const errorResponse = new HttpErrorResponse({
      error: 'Test error',
      status: 404,
      statusText: 'Not Found',
      url: 'api/settings'
    });

    settingService.getSettings.and.returnValue(throwError(() => errorResponse));
    actions$.next(loadSettings());

    // Act
    effects.loadSettings$.subscribe(action => {
      // Assert
      expect(action).toEqual({
        type: '[Settings] Load Settings Failure',
        error: errorResponse
      });
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

  it('should log error details when API call fails', (done) => {
    // Arrange
    const errorResponse = new HttpErrorResponse({
      error: 'Test error',
      status: 500,
      statusText: 'Internal Server Error',
      url: 'api/settings'
    });

    settingService.getSettings.and.returnValue(throwError(() => errorResponse));
    spyOn(console, 'error');
    actions$.next(loadSettings());

    // Act
    effects.loadSettings$.subscribe(() => {
      // Assert
      expect(console.error).toHaveBeenCalledWith('Error details:', {
        status: 500,
        statusText: 'Internal Server Error',
        url: 'api/settings',
        error: 'Test error',
        message: errorResponse.message,
        type: errorResponse.type
      });
      done();
    });
  });
});
