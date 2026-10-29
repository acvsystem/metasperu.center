import { TestBed,fakeAsync,tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting,HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../auth/auth.service';
import { ExportsPage } from './exports-page';
describe('Background report interface',()=>{
  beforeEach(()=>{
    localStorage.removeItem('center-export:1');
    TestBed.configureTestingModule({imports:[ExportsPage],providers:[provideHttpClient(),provideHttpClientTesting(),
      {provide:AuthService,useValue:{user:()=>({id:1,username:'QA'})}}]});
  });
  afterEach(()=>{TestBed.inject(HttpTestingController).verify();localStorage.removeItem('center-export:1');});
  it('submits once, tracks progress and stops polling when the report is ready',fakeAsync(()=>{
    const fixture=TestBed.createComponent(ExportsPage),page=fixture.componentInstance,http=TestBed.inject(HttpTestingController);
    page.start();page.start();const create=http.expectOne('https://api.metasperu.net.pe/s1/center/api/exports');
    expect(create.request.method).toBe('POST');expect(page.starting()).toBeTrue();
    const id='12345678-1234-4234-8234-123456789012';create.flush({id});expect(page.busy()).toBeTrue();
    tick(0);http.expectOne('https://api.metasperu.net.pe/s1/center/api/exports/'+id).flush({id,kind:'transfers',status:'completed',progress:100,processedRows:500,downloadReady:true});
    expect(page.busy()).toBeFalse();expect(page.job()?.processedRows).toBe(500);
    tick(3000);http.expectNone('https://api.metasperu.net.pe/s1/center/api/exports/'+id);fixture.destroy();
  }));
  it('reuses a failed request only while the report parameters remain identical',()=>{
    const fixture=TestBed.createComponent(ExportsPage),page=fixture.componentInstance,http=TestBed.inject(HttpTestingController);
    const url='https://api.metasperu.net.pe/s1/center/api/exports';
    page.start();const first=http.expectOne(url),id=first.request.body.requestId;
    first.flush({}, {status:503,statusText:'Unavailable'});
    page.start();const retry=http.expectOne(url);expect(retry.request.body.requestId).toBe(id);
    retry.flush({}, {status:503,statusText:'Unavailable'});
    page.filter='Otra tienda';page.start();const changed=http.expectOne(url);
    expect(changed.request.body.requestId).not.toBe(id);changed.flush({}, {status:503,statusText:'Unavailable'});
    fixture.destroy();
  });
  it('prevents a second report while resuming an existing job with an unavailable status endpoint',fakeAsync(()=>{
    const id='12345678-1234-4234-8234-123456789012';localStorage.setItem('center-export:1',id);
    const fixture=TestBed.createComponent(ExportsPage),page=fixture.componentInstance,http=TestBed.inject(HttpTestingController);
    expect(page.busy()).toBeTrue();page.start();http.expectNone(request=>request.method==='POST');
    tick(0);http.expectOne('https://api.metasperu.net.pe/s1/center/api/exports/'+id).flush({}, {status:503,statusText:'Unavailable'});
    expect(page.busy()).toBeTrue();expect(page.message()).toContain('seguir en proceso');fixture.destroy();
  }));
});
