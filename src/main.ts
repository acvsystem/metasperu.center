import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';
import { initializeCenterRuntime } from './app/core/runtime-config';


initializeCenterRuntime().then(()=>platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
}))
  .catch(err => console.error(err));
