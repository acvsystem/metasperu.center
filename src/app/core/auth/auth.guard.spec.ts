import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';

describe('Center route access', () => {
  let auth: any;
  beforeEach(() => {
    auth = { isAuthenticated: () => false, user: () => null, checkSession: () => of(false) };
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: auth }] });
  });
  async function access() {
    const result = TestBed.runInInjectionContext(() => authGuard(
      { data: { roles: ['SISTEMAS'] } } as any, { url: '/configuracion' } as any));
    return isObservable(result) ? firstValueFrom(result) : await result;
  }
  it('sends an anonymous deep link to login with a return URL', async () => {
    const result = await access();
    expect(result instanceof UrlTree).toBeTrue();
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Fconfiguracion');
  });
  it('uses the authenticated user role, not a role edited in storage', async () => {
    const previous = localStorage.getItem('role');
    localStorage.setItem('role', 'SISTEMAS');
    try {
      auth.isAuthenticated = () => true;
      auth.user = () => ({ role: 'TIENDA' });
      expect(await access() instanceof UrlTree).toBeTrue();
    } finally {
      previous === null ? localStorage.removeItem('role') : localStorage.setItem('role', previous);
    }
  });
  it('allows a server-restored session with the permitted role', async () => {
    auth.checkSession = () => { auth.user = () => ({ role: 'SISTEMAS' }); return of(true); };
    expect(await access()).toBeTrue();
  });
});
