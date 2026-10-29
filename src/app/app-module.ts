import { NgModule, provideBrowserGlobalErrorListeners, isDevMode, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { ServiceWorkerModule } from '@angular/service-worker';
import { Login } from '../app/features/auth/login/login';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './shared/services/auth.interceptor';
import { MatIconModule } from '@angular/material/icon';













import localeEsPe from '@angular/common/locales/es-PE';
import { registerLocaleData } from '@angular/common';








import { MAT_DATE_LOCALE } from '@angular/material/core';


registerLocaleData(localeEsPe);
@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [App,Login],
  imports: [
    IonicModule.forRoot(),BrowserModule,FormsModule,ReactiveFormsModule,MatIconModule,AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js',{enabled:!isDevMode(),registrationStrategy:'registerWhenStable:30000'})
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
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


