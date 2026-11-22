import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

// Necessário para o pipe "currency" mostrar "R$ 6,60" (vírgula) em vez de "R$6.60"
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // habilita chamadas HTTP (API) em qualquer parte da aplicação
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
