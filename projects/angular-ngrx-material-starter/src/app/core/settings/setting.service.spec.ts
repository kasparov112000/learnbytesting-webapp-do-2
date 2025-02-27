import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { SettingService } from './setting.service';
import { AuthService } from '../auth/auth.service';
import { BaseService } from '../services/base.service';

describe('SettingService', () => {
  let service: SettingService;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);
    authServiceSpy.getToken.and.returnValue('mock-token');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SettingService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(SettingService);
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should extend BaseService', () => {
    expect(service instanceof BaseService).toBeTruthy();
  });

  it('should initialize with correct base path', () => {
    expect((service as any).basePath).toBe('settings');
  });

  describe('getSettings', () => {
    const mockSettingsResponse = `window.env = {
      "apiUrl": "http://localhost:3000",
      "production": false
    }`;

    it('should make GET request to correct URL', () => {
      service.getSettings().subscribe();

      const req = httpMock.expectOne('/api/settings/env.js');
      expect(req.request.method).toBe('GET');
      req.flush(mockSettingsResponse);
    });

    it('should request text response type', () => {
      service.getSettings().subscribe();

      const req = httpMock.expectOne('/api/settings/env.js');
      expect(req.request.responseType).toBe('text');
      req.flush(mockSettingsResponse);
    });

    it('should return settings text content', (done) => {
      service.getSettings().subscribe(response => {
        expect(response).toBe(mockSettingsResponse);
        done();
      });

      const req = httpMock.expectOne('/api/settings/env.js');
      req.flush(mockSettingsResponse);
    });

    it('should handle empty response', (done) => {
      service.getSettings().subscribe(response => {
        expect(response).toBe('');
        done();
      });

      const req = httpMock.expectOne('/api/settings/env.js');
      req.flush('');
    });

    it('should handle error response', (done) => {
      const errorMessage = 'Settings not found';

      service.getSettings().subscribe({
        error: error => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
          done();
        }
      });

      const req = httpMock.expectOne('/api/settings/env.js');
      req.flush(errorMessage, {
        status: 404,
        statusText: 'Not Found'
      });
    });
  });

  describe('inheritance from BaseService', () => {

    it('should handle HttpClient injection', () => {
      expect(() => new SettingService(httpClient, authService)).not.toThrow();
    });

    it('should pass correct parameters to BaseService constructor', () => {
      const newService = new SettingService(httpClient, authService);
      expect((newService as any).basePath).toBe('settings');
      expect((newService as any).httpClient).toBeTruthy();
      expect((newService as any).authService).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should handle HTTP 500 error', (done) => {
      service.getSettings().subscribe({
        error: error => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
          done();
        }
      });

      const req = httpMock.expectOne('/api/settings/env.js');
      req.flush('Internal Server Error', {
        status: 500,
        statusText: 'Internal Server Error'
      });
    });

    it('should handle HTTP 403 error', (done) => {
      service.getSettings().subscribe({
        error: error => {
          expect(error.status).toBe(403);
          expect(error.statusText).toBe('Forbidden');
          done();
        }
      });

      const req = httpMock.expectOne('/api/settings/env.js');
      req.flush('Forbidden', {
        status: 403,
        statusText: 'Forbidden'
      });
    });

    it('should handle malformed response', (done) => {
      const malformedResponse = 'invalid javascript';

      service.getSettings().subscribe(response => {
        expect(response).toBe(malformedResponse);
        done();
      });

      const req = httpMock.expectOne('/api/settings/env.js');
      req.flush(malformedResponse);
    });
  });
});
