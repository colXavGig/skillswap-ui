import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInjectorInterceptor } from './http/interceptor/jwt-injector-interceptor';
import { unauthorizedInterceptorInterceptor } from './http/interceptor/unauthorized-interceptor-interceptor';
import { apiErrorMapperInterceptor } from './http/interceptor/api-error-mapper-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        jwtInjectorInterceptor,
        unauthorizedInterceptorInterceptor,
        apiErrorMapperInterceptor
      ])
    ),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
