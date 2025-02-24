import { Injectable } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
// ort { authLogout, authSetProfileFailure, authSetProfileSuccessJwt } from '@core/store/auth/auth.actions';
// import { authLoginSuccess, authLogoutSuccess, authSetProfile } from '../../store/auth/auth.actions';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  accessToken: string;
  userProfile: any = {};
  expiresAt: number;
  loggedIn = false;
  loggedIn$ = new BehaviorSubject<boolean>(this.loggedIn);
  refreshSub: Subscription;
  roles: string[] = []; // Store user roles

  constructor(
    private router: Router,
    private store: Store,
    private auth0: Auth0Service, // Inject the Auth0 Angular service
  ) {
    // Check if a valid token exists and set the login status accordingly
    this.auth0.isAuthenticated$.pipe(take(1)).subscribe((loggedIn) => {
      this.setLoggedIn(loggedIn);
      if (loggedIn) {
        this.loadProfile();
      }
    });
  }

  // Set logged in status
  setLoggedIn(value: boolean) {
    this.loggedIn$.next(value);
    this.loggedIn = value;
  }

  // Login method
  login(): void {
    this.auth0.loginWithRedirect();
  }

  // Handle the callback after authentication
  handleAuth(): void {
    this.auth0.handleRedirectCallback().subscribe({
      next: () => {
        this.loadProfile();
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.router.navigate(['/']);
        console.error('Error authenticating:', err);
      },
    });
  }

  // Load the user profile and store it
  // Load the user profile and store it
  loadProfile(): void {
    this.auth0.user$.subscribe((profile) => {
      if (profile) {
        this.userProfile = profile;

        // Extract and store user roles from custom claim (if present)
        const rolesClaim = profile['https://your-app.com/roles']; // Replace with your actual roles claim
        if (rolesClaim) {
          this.roles = rolesClaim;
        } else {
          this.roles = [];
        }
      }
      // this.store.dispatch(authSetProfileSuccessJwt({ profile, ...this.roles }));

    });
  }

  // Logout method
  logout(): void {
    this.auth0.logout({
      // returnTo: window.location.origin,

    });
    // this.store.dispatch(authLogoutSuccess());
  }

  // Method to get the token validity
  get tokenValid(): boolean {
    // Use isAuthenticated$ observable to check if token is valid
    let isValid = false;
    this.auth0.isAuthenticated$.subscribe((valid) => {
      isValid = valid;
    });
    return isValid;
  }

  // Renew token if necessary
  renewToken(): void {
    this.auth0.getAccessTokenSilently().subscribe((token) => {
      this.accessToken = `Bearer ${token}`;
    });
  }
}
