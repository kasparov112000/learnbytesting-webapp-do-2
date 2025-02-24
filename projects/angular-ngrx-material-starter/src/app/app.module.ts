import { ApplicationConfig, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { routes } from './app-routing.module';
import { loadSettings } from './core/settings/settings.actions';
import { inject } from '@angular/core';
import { settingsReducer } from './core/settings/settings.reducer';
import { SettingsEffects } from './core/settings/settings.effects';

// Add your root reducer map
const reducers = {
  settings: settingsReducer
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(reducers), // Initialize with your reducers
    provideEffects([SettingsEffects]),
    provideRouter(routes),
    provideAppInitializer(() => {
      console.log('App initializer running');
      const store = inject(Store);
      console.log('Store injected');
      store.dispatch(loadSettings());
      console.log('LoadSettings action dispatched');
    })
  ]
};
