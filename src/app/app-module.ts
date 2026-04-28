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
import { MatTabsModule } from '@angular/material/tabs';
import { MtDatatable } from './shared/component/mt-datatable/mt-datatable';
import { MtInput } from './shared/component/mt-input/mt-input';
import { MtSelect } from './shared/component/mt-select/mt-select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenu } from '@angular/material/menu';
import { MatMenuModule } from '@angular/material/menu';
import { Inventario } from './features/pages/inventario/inventario';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MtNotification } from './shared/component/mt-notification/mt-notification';
import { MtLoader } from './shared/component/mt-loader/mt-loader';
import localeEsPe from '@angular/common/locales/es-PE';
import { registerLocaleData } from '@angular/common';
import { RrhhAsistencia } from './features/pages/rrhh-asistencia/rrhh-asistencia';
import { MtCalendar } from './shared/component/mt-calendar/mt-calendar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { MtMarcacionesEmployes } from './shared/component/mt-datatable/component/mt-marcaciones-employes/mt-marcaciones-employes';
import { MtViewPapeleta } from './shared/component/mt-view-papeleta/mt-view-papeleta';
import { RrhhHorario } from './features/pages/rrhh-horario/rrhh-horario';
import { Kardex } from './features/pages/kardex/kardex';
import { MtKardex } from './features/pages/kardex/component/mt-kardex/mt-kardex';
import { MatListModule } from '@angular/material/list';
import { MtCuo } from './features/pages/kardex/component/mt-cuo/mt-cuo';
import { Traspasos } from './features/pages/traspasos/traspasos';
import { MtCreationTraspasos } from './features/pages/traspasos/component/mt-creation-traspasos/mt-creation-traspasos';
import { MtRegistrosTraspasos } from './features/pages/traspasos/component/mt-registros-traspasos/mt-registros-traspasos';
import { PanelHorario } from './features/pages/panel-horario/panel-horario';
import { MtRegistrosHorarios } from './features/pages/panel-horario/component/mt-rw-horario/component/mt-registros-horarios/mt-registros-horarios';
import { MtRwHorario } from './features/pages/panel-horario/component/mt-rw-horario/mt-rw-horario';
import { MtMdlRangoHora } from './features/pages/panel-horario/component/mt-rw-horario/component/mt-mdl-rango-hora/mt-mdl-rango-hora';
import { MtMdlAsignarPersonal } from './features/pages/panel-horario/component/mt-rw-horario/component/mt-mdl-asignar-personal/mt-mdl-asignar-personal';
import { ExchangeRateStore } from './features/pages/exchange-rate-store/exchange-rate-store';
import { MtMdlInfoHorario } from './features/pages/panel-horario/component/mt-rw-horario/component/mt-mdl-info-horario/mt-mdl-info-horario';
import { MtMdlObervaciones } from './features/pages/panel-horario/component/mt-rw-horario/component/mt-mdl-obervaciones/mt-mdl-obervaciones';
import { MatSelectModule } from '@angular/material/select';
import { MtRwPapeleta } from './features/pages/panel-horario/component/mt-rw-papeleta/mt-rw-papeleta';
import { AutorizacionHorasExtras } from './features/pages/autorizacion-horas-extras/autorizacion-horas-extras';
import { MtComentario } from './features/pages/autorizacion-horas-extras/component/mt-comentario/mt-comentario';
import { MtRPapeletas } from './features/pages/panel-horario/component/mt-r-papeletas/mt-r-papeletas';

registerLocaleData(localeEsPe);
@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    App,
    Login,
    Dashboard,
    MtDatatable,
    MtInput,
    MtSelect,
    Inventario,
    MtNotification,
    MtLoader,
    RrhhAsistencia,
    MtCalendar,
    MtMarcacionesEmployes,
    MtViewPapeleta,
    RrhhHorario,
    Kardex,
    MtKardex,
    MtCuo,
    Traspasos,
    MtCreationTraspasos,
    MtRegistrosTraspasos,
    PanelHorario,
    MtRegistrosHorarios,
    MtRwHorario,
    MtMdlRangoHora,
    MtMdlAsignarPersonal,
    ExchangeRateStore,
    MtMdlInfoHorario,
    MtMdlObervaciones,
    MtRwPapeleta,
    AutorizacionHorasExtras,
    MtComentario,
    MtRPapeletas
  ],
  imports: [
    IonicModule.forRoot(),
    FormsModule,
    MatSelectModule,
    MatMenu,
    MatMenuModule,
    MatFormFieldModule,
    MatTabsModule,
    MatPaginatorModule,
    MatToolbarModule,
    MatInputModule,
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
    MatDatepickerModule,
    MatChipsModule,
    MatListModule,
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


