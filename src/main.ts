import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { routes } from './app/app.routes';

import { authInterceptor } from './app/core/interceptors/auth.interceptor'; // ✅ interceptor

bootstrapApplication(AppComponent, {
  providers: [
    ...(appConfig.providers || []),

    // ✅ Router (if using standalone routing)
    provideRouter(routes),

    // 🔥 HTTP + INTERCEPTOR (MOST IMPORTANT)
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    )
  ]
})
.catch((err) => console.error(err));
document.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});