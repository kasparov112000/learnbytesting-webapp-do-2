import { inject, Injectable } from '@angular/core';
import { Action, select, Store } from '@ngrx/store';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { tap, withLatestFrom } from 'rxjs/operators';

import { LocalStorageService } from '../../../core/core.module';

import { State } from '../examples.state';
import * as todoAction from './todos.actions';
import { selectTodosState } from './todos.selectors';

export const TODOS_KEY = 'EXAMPLES.TODOS';

@Injectable()
export class TodosEffects {

  /*
   *
   * @INJECT
   */
  private actions$ = inject(Actions);
  private store = inject(Store<State>);
  private  localStorageService = inject(LocalStorageService);

  persistTodos = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          todoAction.actionTodosAdd,
          todoAction.actionTodosFilter,
          todoAction.actionTodosRemoveDone,
          todoAction.actionTodosToggle
        ),
        withLatestFrom(this.store.pipe(select(selectTodosState))),
        tap(([action, todos]) =>
          this.localStorageService.setItem(TODOS_KEY, todos)
        )
      ),
    { dispatch: false, allowSignalWrites: true }
  );

  constructor() {}
}
