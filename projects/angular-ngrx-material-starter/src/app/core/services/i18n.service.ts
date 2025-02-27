


import { Injectable } from '@angular/core';
import * as i18next from 'i18next';
import * as LngDetector from 'i18next-browser-languagedetector';
import { Subject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class I8nService {

  translationsLoaded = new Subject();

  isLoaded = false;

  constructor() {

    i18next
      // .use(Backend)
      .use(LngDetector as any)
      .init({
        lng: 'en-us',
        fallbackLng: 'en-us',
        ns: [
          'category',
          'common',
          'document',
          'menu',
          'project',
          'user',
          'email',
          'scraper',
          'session',
          'question',
          'exam',
          'home',
          'auth',
          'settings'
        ],
        defaultNS: 'menu',
        debug: true,
        lowerCaseLng: true,
        detection: {
          order: ['navigator', 'querystring', 'cookie', 'localStorage', 'htmlTag']
        },
        backend: {
          loadPath: '/assets/locales/{{lng}}/{{ns}}.json',
        }
      }, (err, t) => {
          if (err) { return console.log('something went wrong loading', err); }
        this.translationsLoaded.next(true);
        this.isLoaded = true;
      });
  }

  public t(i18nKey: string, options?: any): string;
  public t(i18nKey: string[], options?: any): string;

  public t(i18nKey: string[] | string, options?: any): string {
      return i18next.t(i18nKey, options) as string;
  }
}
