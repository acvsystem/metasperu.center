import { NgModule } from '@angular/core';
import { RouterModule,Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { Login } from './features/auth/login/login';
const routes:Routes=[
  {path:'',pathMatch:'full',component:Login},
  {path:'login',component:Login},
  {path:'exportaciones',canActivate:[authGuard],data:{roles:['SISTEMAS']},loadComponent:()=>import('./core/exports/exports-page').then(module=>module.ExportsPage)},
  {path:'actualizaciones',canActivate:[authGuard],loadComponent:()=>import('./core/updates/updates-page').then(module=>module.UpdatesPage)},
  {path:'',loadChildren:()=>import('./workspace-module').then(module=>module.WorkspaceModule)},
  {path:'**',redirectTo:'login'}
];
@NgModule({imports:[RouterModule.forRoot(routes,{onSameUrlNavigation:'reload'})],exports:[RouterModule]})
export class AppRoutingModule {}
