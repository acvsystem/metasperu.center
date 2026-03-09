import { NgModule, provideBrowserGlobalErrorListeners, isDevMode, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { ServiceWorkerModule } from '@angular/service-worker';
import { Login } from '../app/features/auth/login/login';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Dashboard } from './features/pages/dashboard/dashboard'; // 1. Importar la función
import { authInterceptor } from './shared/services/auth.interceptor';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    App,
    Login,
    Dashboard,
  ],
  imports: [
    IonicModule.forRoot(),
    FormsModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatIconModule,
    MatSidenavModule,
    MatTooltipModule,
    MatButtonModule,
    BrowserModule,
    MatTableModule,
    ReactiveFormsModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-PE' },
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
  bootstrap: [App]
})
export class AppModule { }


