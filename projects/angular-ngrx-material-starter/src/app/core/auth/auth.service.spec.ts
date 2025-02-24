import { TestBed  } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let auth0ServiceMock: jasmine.SpyObj<Auth0Service>;
  let routerMock: jasmine.SpyObj<Router>;
  let storeMock: jasmine.SpyObj<Store>;

  const mockProfile = {
    sub: 'auth0|123',
    name: 'Test User',
    email: 'test@example.com',
    'https://your-app.com/roles': ['admin', 'user']
  };

  beforeEach(() => {
    auth0ServiceMock = jasmine.createSpyObj('Auth0Service', [
      'loginWithRedirect',
      'handleRedirectCallback',
      'logout',
      'getAccessTokenSilently'
    ], {
      isAuthenticated$: new BehaviorSubject<boolean>(false),
      user$: new BehaviorSubject<any>(null)
    });

    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    storeMock = jasmine.createSpyObj('Store', ['dispatch']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Auth0Service, useValue: auth0ServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: Store, useValue: storeMock }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setLoggedIn', () => {
    it('should update loggedIn status', () => {
      service.setLoggedIn(true);
      expect(service.loggedIn).toBe(true);
      service.loggedIn$.subscribe(status => expect(status).toBe(true));
    });
  });

  describe('login', () => {
    it('should call Auth0 loginWithRedirect', () => {
      service.login();
      expect(auth0ServiceMock.loginWithRedirect).toHaveBeenCalled();
    });
  });

  describe('loadProfile', () => {
    it('should load and store user profile', (done) => {
      (auth0ServiceMock.user$ as BehaviorSubject<any>).next(mockProfile);
      service.loadProfile();

      setTimeout(() => {
        expect(service.userProfile).toEqual(mockProfile);
        expect(service.roles).toEqual(['admin', 'user']);
        done();
      });
    });

    it('should handle profile without roles', (done) => {
      const profileWithoutRoles = { ...mockProfile };
      delete profileWithoutRoles['https://your-app.com/roles'];

      (auth0ServiceMock.user$ as BehaviorSubject<any>).next(profileWithoutRoles);
      service.loadProfile();

      setTimeout(() => {
        expect(service.userProfile).toEqual(profileWithoutRoles);
        expect(service.roles).toEqual([]);
        done();
      });
    });

    it('should handle null profile', (done) => {
      (auth0ServiceMock.user$ as BehaviorSubject<any>).next(null);
      service.loadProfile();

      setTimeout(() => {
        expect(service.userProfile).toEqual({});
        expect(service.roles).toEqual([]);
        done();
      });
    });
  });

  describe('handleAuth', () => {
    it('should handle successful authentication', (done) => {
      auth0ServiceMock.handleRedirectCallback.and.returnValue(of({}));

      service.handleAuth();

      setTimeout(() => {
        expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
        done();
      });
    });

    it('should handle authentication error', (done) => {
      auth0ServiceMock.handleRedirectCallback.and.returnValue(
        throwError(() => new Error('Auth Error'))
      );

      service.handleAuth();

      setTimeout(() => {
        expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
        done();
      });
    });
  });

  describe('renewToken', () => {
    it('should renew access token', (done) => {
      auth0ServiceMock.getAccessTokenSilently.and.returnValue(of('new-token'));

      service.renewToken();

      setTimeout(() => {
        expect(service.accessToken).toBe('Bearer new-token');
        done();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple login/logout cycles', (done) => {
      service.setLoggedIn(true);
      expect(service.loggedIn).toBe(true);

      service.logout();
      expect(auth0ServiceMock.logout).toHaveBeenCalled();

      service.setLoggedIn(false);

      setTimeout(() => {
        expect(service.loggedIn).toBe(false);
        done();
      });
    });

    it('should handle rapid profile updates', (done) => {
      const profiles = [mockProfile, { ...mockProfile, name: 'Updated User' }];

      profiles.forEach(profile => {
        (auth0ServiceMock.user$ as BehaviorSubject<any>).next(profile);
        service.loadProfile();
      });

      setTimeout(() => {
        expect(service.userProfile).toEqual(profiles[1]);
        done();
      });
    });

    it('should handle authentication state changes', (done) => {
      const states = [true, false, true];

      states.forEach(state => {
        (auth0ServiceMock.isAuthenticated$ as BehaviorSubject<boolean>).next(state);
      });

      setTimeout(() => {
        expect(service.tokenValid).toBe(true);
        done();
      });
    });
  });
});
