import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { Login } from '@metasperu/page/features/auth/login/login';
import { Dashboard } from '@metasperu/page/features/pages/dashboard/dashboard';
import { Inventario } from '@metasperu/page/features/pages/inventario/inventario';
import { RrhhAsistencia } from '@metasperu/page/features/pages/rrhh-asistencia/rrhh-asistencia';
import { RrhhHorario } from '@metasperu/page/features/pages/rrhh-horario/rrhh-horario';
import { Kardex } from '@metasperu/page/features/pages/kardex/kardex';
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
    data: { roles: ['SISTEMAS', 'RRHH', 'INVENTARIO', 'OPERACIONES'] }
  },
  {
    path: 'asistencia',
    component: RrhhAsistencia,
    canActivate: [authGuard],
    data: { roles: ['SISTEMAS', 'RRHH', 'OPERACIONES'] }
  },
  {
    path: 'horario',
    component: RrhhHorario,
    canActivate: [authGuard],
    data: { roles: ['SISTEMAS', 'RRHH', 'OPERACIONES', 'TIENDAS'] }
  },
  {
    path: 'kardex',
    component: Kardex,
    canActivate: [authGuard],
    data: { roles: ['SISTEMAS', 'CONTABILIDAD'] }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
