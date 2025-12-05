import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient } from '@angular/common/http';

// Animaciones (async recomendado con Angular 17/19)
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// PrimeNG config
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura'; // 👈 puedes cambiar por Lara, Nora, etc.

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),

    // 👇 Habilitar animaciones para cosas como @messageAnimation
    provideAnimationsAsync(),

    // 👇 Configurar tema de PrimeNG v19
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          // Opcionales, pero bien tenerlos explícitos
          prefix: 'p',
          darkModeSelector: 'system',
          cssLayer: false
        }
      },
      ripple: true,        // Si quieres efecto ripple en botones
      inputVariant: 'filled'
    }),

    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
