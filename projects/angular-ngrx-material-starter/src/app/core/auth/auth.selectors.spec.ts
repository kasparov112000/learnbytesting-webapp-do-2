import { selectAuth, selectIsAuthenticated } from './auth.selectors';
import { AppState } from '../core.state';
import { AuthState } from './auth.models';

describe('Auth Selectors', () => {
  let state: AppState;
  let authState: AuthState;

  beforeEach(() => {
    // Set up fresh state before each test
    authState = {
      isAuthenticated: false
    };
    state = {
      auth: authState,
      settings: {} as any,
      router: {} as any
    };
  });

  describe('selectAuth', () => {
    it('should select the auth state', () => {
      // This will exercise line 8 with the type annotation
      const result: AuthState = selectAuth(state);
      expect(result).toEqual(authState);
    });
  });

  describe('selectIsAuthenticated', () => {
    it('should select auth true state', () => {
      // This will exercise line 13 with true value
      state.auth.isAuthenticated = true;
      const result = selectIsAuthenticated(state);
      expect(result).toBe(true);
    });
  });
});
