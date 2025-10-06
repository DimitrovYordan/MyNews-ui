import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { appRoutes } from './app.routes';
import { authInterceptorFn } from './interceptors/auth.interceptor';
import { loadingInterceptorFn } from './interceptors/loading.interceptor';
import { LanguageService } from './services/language.service';
import { MyTranslateLoader } from './app';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptorFn, loadingInterceptorFn])),
    LanguageService,
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: MyTranslateLoader
        }
      })
    )
  ]
};