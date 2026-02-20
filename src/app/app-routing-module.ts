import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { Login } from '@metasperu/page/features/auth/login/login';
import { Dashboard } from '@metasperu/page/features/pages/dashboard/dashboard';

const routes: Routes = [
  { path: '', component: Login },
  { path: 'login', component: Login },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    data: { roles: ['SISTEMAS', 'auditor'] }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
