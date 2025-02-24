import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../services/base.service';
import { AuthService } from '../auth/auth.service';
// import { MessagingService } from '../services/messaging.service';


@Injectable({providedIn: 'root'})
export class SettingService extends BaseService {
  constructor(
    httpClient: HttpClient,
    authService: AuthService
  )
    {
    super('settings', httpClient, authService
    );
  }
  getSettings(){
    const path = `/api/settings/env.js`;
    return this.httpClient
      .get(path, {
         responseType: 'text'
      });
  }
}
