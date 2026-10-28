import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = route.data['roles'] as string[] | undefined;
  const login = () => router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  const access = () => {
    const role = auth.user()?.role;
    return !roles?.length || (role && roles.includes(role)) ? true : login();
  };
  if (auth.isAuthenticated()) return access();
  return auth.checkSession().pipe(take(1), map(loggedIn => loggedIn ? access() : login()));
};
