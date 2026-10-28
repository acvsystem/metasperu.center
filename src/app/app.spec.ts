import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { App } from './app';
import { AuthService } from './core/auth/auth.service';
import { RrwebRecorderService } from './shared/services/rrweb-recorder.service';

describe('Center workspace', () => {
  let auth: any;
  beforeEach(async () => {
    auth = { isAuthenticated: jasmine.createSpy().and.returnValue(false), onMenu: new EventEmitter(), logout: jasmine.createSpy().and.resolveTo() };
    await TestBed.configureTestingModule({ imports:[RouterModule.forRoot([]),IonicModule.forRoot()],
      declarations:[App], schemas:[CUSTOM_ELEMENTS_SCHEMA], providers:[
        {provide:AuthService,useValue:auth}, {provide:SwUpdate,useValue:{isEnabled:false}},
        {provide:RrwebRecorderService,useValue:{start:jasmine.createSpy(),stop:jasmine.createSpy()}},
      ] }).overrideComponent(App, { set: { template: '' } }).compileComponents();
  });
  it('creates the workspace and keeps server menu options grouped without adding permissions', () => {
    const app=TestBed.createComponent(App).componentInstance;
    app.menuFiltrado=[{nombre:'Usuarios',ruta:'configuracion'},{nombre:'Ventas',ruta:'/reportes'},{nombre:'Área especial',ruta:'custom-area'}];
    expect(app.menuGroups.map(group=>group.name)).toEqual(['Operaciones','Reportes','Administración']);
    expect(app.menuGroups.flatMap(group=>group.items).length).toBe(3);
  });
  it('marks the active route even when its server menu uses a leading slash', () => {
    const app=TestBed.createComponent(App).componentInstance;
    app.currentRoute.set('/reportes?periodo=mes');expect(app.isActive('/reportes')).toBeTrue();expect(app.isActive('configuracion')).toBeFalse();
  });
  it('dismisses the account overlay before starting logout', async () => {
    const app=TestBed.createComponent(App).componentInstance;
    let finish!: (value:boolean)=>void;
    app.accountPopover={dismiss:()=>new Promise<boolean>(resolve=>finish=resolve)} as any;
    const pending=app.logout();expect(auth.logout).not.toHaveBeenCalled();finish(true);await pending;expect(auth.logout).toHaveBeenCalledTimes(1);
  });
});