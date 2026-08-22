import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { Login } from '@metasperu/page/features/auth/login/login';
import { Dashboard } from '@metasperu/page/features/pages/dashboard/dashboard';
import { Inventario } from '@metasperu/page/features/pages/inventario/inventario';
import { RrhhAsistencia } from '@metasperu/page/features/pages/rrhh-asistencia/rrhh-asistencia';
import { RrhhHorario } from '@metasperu/page/features/pages/rrhh-horario/rrhh-horario';
import { Kardex } from '@metasperu/page/features/pages/kardex/kardex';
import { Traspasos } from '@metasperu/page/features/pages/traspasos/traspasos';
import { PanelHorario } from './features/pages/panel-horario/panel-horario';
import { ExchangeRateStore } from './features/pages/exchange-rate-store/exchange-rate-store';
import { AutorizacionHorasExtras } from '@metasperu/page/features/pages/autorizacion-horas-extras/autorizacion-horas-extras';
import { Configuration } from '@metasperu/page/features/pages/configuration/configuration';
import { RrwebSessions } from '@metasperu/page/features/pages/rrweb-sessions/rrweb-sessions';
import { ApiLogs } from '@metasperu/page/features/pages/api-logs/api-logs';
import { PanelReportes } from '@metasperu/page/features/pages/panel-reportes/panel-reportes';

const routes: Routes = [
  { path: '', component: Login },
  { path: 'login', component: Login },
  {
    path: 'comprobantes',
    component: Dashboard,
    canActivate: [authGuard],
    data: { roles: ['SISTEMAS', 'RRHH'] }
  },
  {
    path: 'inventario',
    component: Inventario,
    canActivate: [authGuard],
    data: { roles: ['SISTEMAS', 'RRHH', 'INVENTARIO', 'OPERACIONES', 'TIENDA', 'MARKETING', 'FIELDLEADER'] }
  },
  {
    path: 'asistencia',
    component: RrhhAsistencia,
    canActivate: [authGuard],
    data: { roles: ['SISTEMAS', 'RRHH', 'OPERACIONES', 'FIELDLEADER', 'TIENDA'] }
  },
  {
    path: 'horario',
    component: RrhhHorario,
    canActivate: [authGuard],
    data: { roles: ['SISTEMAS', 'RRHH', 'OPERACIONES', 'TIENDA'] }
  },
  {
    path: 'kardex',
    component: Kardex,
    canActivate: [authGuard],
    data: { roles: ['SISTEMAS', 'CONTABILIDAD'] }
  },
  {
    path: 'traspaso_inventario',
    component: Traspasos,
    canActivate: [authGuard],
    data: { roles: ['SISTEMAS', 'OPERACIONES', 'INVENTARIO'] }
  },
  {
    path: 'panel-horario',
    component: PanelHorario,
    canActivate: [authGuard],
    data: { roles: ['SISTEMAS', 'OPERACIONES', 'TIENDA', 'RRHH', 'MARKETING', 'FIELDLEADER'] }
  },
  {
    path: 'tipo-cambio',
    component: ExchangeRateStore,
    canActivate: [authGuard],
    data: { roles: ['SISTEMAS', 'CONTABILIDAD'] }
  },
  {
    path: 'auth-hora-extra',
    component: AutorizacionHorasExtras,
    canActivate: [authGuard],
    data: { roles: ['SISTEMAS', 'RRHH', 'OPERACIONES'] }
  },
  {
    path: 'configuracion',
    component: Configuration,
    canActivate: [authGuard],
    data: { roles: ['SISTEMAS', 'RRHH'] }
  },
  {
    path: 'recoding',
    component: RrwebSessions,
    canActivate: [authGuard],
    data: { roles: ['SISTEMAS'] }
  },
  {
    path: 'api-logs',
    component: ApiLogs,
    canActivate: [authGuard],
    data: { roles: ['SISTEMAS'] }
  },
  {
    path: 'reportes',
    component: PanelReportes,
    canActivate: [authGuard],
    data: { roles: ['SISTEMAS', 'OPERACIONES', 'FIELDLEADER'] }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
