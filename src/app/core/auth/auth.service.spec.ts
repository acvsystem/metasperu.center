import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting,HttpTestingController } from '@angular/common/http/testing';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { StoreService } from '../../shared/services/store.service';
import { SocketService } from '../../shared/services/socket.service';
import { RrwebRecorderService } from '../../shared/services/rrweb-recorder.service';
describe('Verified session restoration',()=>{
  it('refreshes account context before notifying the shell and preserves unrelated drafts',()=>{
    TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting(),
      {provide:Router,useValue:{}},{provide:NavController,useValue:{navigateRoot:()=>Promise.resolve(true)}},
      {provide:StoreService,useValue:{encrypt:(value:string)=>value}},
      {provide:SocketService,useValue:{desconectar:()=>{}}},{provide:RrwebRecorderService,useValue:{stop:()=>Promise.resolve()}}]});
    localStorage.setItem('name','OLD');localStorage.setItem('role','TIENDA');localStorage.setItem('qa-unrelated-draft','keep');
    const auth=TestBed.inject(AuthService),http=TestBed.inject(HttpTestingController);let notifiedName='';
    const subscription=auth.onMenu.subscribe(()=>notifiedName=localStorage.getItem('name')||'');
    auth.checkSession().subscribe();
    http.expectOne('https://api.metasperu.net.pe/s2/auth/center/check-session').flush({id:1,username:'CURRENT',role:'SISTEMAS',email:'qa@example.invalid',code_store:'QA01',old_code_store:'',menu:[{nombre:'QA',ruta:'dashboard'}]});
    expect(notifiedName).toBe('CURRENT');expect(localStorage.getItem('role')).toBe('SISTEMAS');
    expect(localStorage.getItem('qa-unrelated-draft')).toBe('keep');expect(localStorage.getItem('auth_token')).toBeNull();
    subscription.unsubscribe();http.verify();
    for(const key of ['name','role','menu','keyStore','keyStore_2','marca','qa-unrelated-draft'])localStorage.removeItem(key);
  });
});
