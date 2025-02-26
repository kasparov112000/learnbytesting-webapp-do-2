import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ofType, createEffect, Actions } from '@ngrx/effects';
import { tap } from 'rxjs/operators';

import { LocalStorageService } from '../local-storage/local-storage.service';

import { authLogin, authLogout } from './auth.actions';

export const AUTH_KEY = 'AUTH';

@Injectable()
export class AuthEffects {

  /*
   *
   * @INJECT
   */
  public actions$ = inject(Actions);
  public localStorageService = inject(LocalStorageService);
  public router = inject(Router);

  login = createEffect(
    () =>
      this.actions$.pipe(
        ofType(authLogin),
        tap(() =>
          this.localStorageService.setItem(AUTH_KEY, { isAuthenticated: true })
        )
      ),
    { dispatch: false, allowSignalWrites: true }
  );

  logout = createEffect(
    () =>
      this.actions$.pipe(
        ofType(authLogout),
        tap(() => {
          this.router.navigate(['']);
          this.localStorageService.setItem(AUTH_KEY, {
            isAuthenticated: false
          });
        })
      ),
    { dispatch: false, allowSignalWrites: true }
  );
}
