import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';
import {
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  includeBearerTokenInterceptor,
  IncludeBearerTokenCondition,
  KeycloakService
} from 'keycloak-angular';

const apiCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: /^(http:\/\/localhost:8080)(\/.*)?$/i,
  bearerPrefix: 'Bearer'
});

function initializeKeycloak(keycloak: KeycloakService) {
  return () => keycloak.init({
    config: {
      url: 'http://localhost:8787',
      realm: 'jlog',
      clientId: 'jlog-frontend'
    },
    initOptions: {
      onLoad: 'login-required',
      //silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      //pkceMethod: 'S256',
      checkLoginIframe: false,
      //enableLogging: false
    }
  });
}

bootstrapApplication(AppComponent, {
  providers: [
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      deps: [KeycloakService],
      multi: true
    },
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [apiCondition]
    },
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor]))
  ]
}).catch(err => console.error(err));
