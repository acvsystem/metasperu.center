import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SessionState } from '../../core/auth/session-state';
import { authInterceptor } from './auth.interceptor';

describe('Center API credentials', () => {
  let http: HttpClient, controller: HttpTestingController, state: SessionState;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()] });
    http = TestBed.inject(HttpClient); controller = TestBed.inject(HttpTestingController); state = TestBed.inject(SessionState);
    state.open('TEST-ONLY-TOKEN');
  });
  afterEach(() => controller.verify());
  it('never sends a bearer to a third party or another application', () => {
    for (const url of ['https://example.invalid/x','https://api.metasperu.net.pe/s3/inventory/stores']) {
      http.get(url).subscribe();const req=controller.expectOne(url);expect(req.request.headers.has('Authorization')).toBeFalse();expect(req.request.withCredentials).toBeFalse();req.flush([]);
    }
  });
  it('sends credentials only to the authorized Center APIs', () => {
    const url='https://api.metasperu.net.pe/s1/center/api/store';http.get(url).subscribe();const req=controller.expectOne(url);
    expect(req.request.headers.get('Authorization')).toBe('Bearer TEST-ONLY-TOKEN');expect(req.request.withCredentials).toBeTrue();req.flush([]);
  });
  it('expires one active session when a protected request returns 401', () => {
    let expired=0;state.expired.subscribe(()=>expired++);
    const url='https://api.metasperu.net.pe/s1/center/api/store';http.get(url).subscribe({error:()=>{}});
    controller.expectOne(url).flush({}, {status:401,statusText:'Unauthorized'});expect(state.active()).toBeFalse();expect(expired).toBe(1);
  });
  it('does not keep access tokens in browser storage', () => {
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
