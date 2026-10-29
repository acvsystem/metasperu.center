import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { UpdateService,RELOAD_APP } from './update.service';
describe('Controlled application updates',()=>{
  it('notifies without reloading and blocks installation while changes are pending',async()=>{
    const events=new Subject<any>(),reload=jasmine.createSpy();
    const sw={isEnabled:true,versionUpdates:events,checkForUpdate:()=>Promise.resolve(false),activateUpdate:jasmine.createSpy().and.resolveTo(true)};
    TestBed.configureTestingModule({providers:[{provide:SwUpdate,useValue:sw},{provide:RELOAD_APP,useValue:reload}]});
    const updates=TestBed.inject(UpdateService);
    events.next({type:'VERSION_READY',latestVersion:{hash:'next',appData:{version:'next',notes:['Una mejora']}}});
    expect(updates.available()?.version).toBe('next');expect(reload).not.toHaveBeenCalled();
    updates.protectReload(()=>false);await updates.apply();expect(sw.activateUpdate).not.toHaveBeenCalled();expect(reload).not.toHaveBeenCalled();
    updates.protectReload(()=>true);await updates.apply();expect(sw.activateUpdate).toHaveBeenCalledTimes(1);expect(reload).toHaveBeenCalledTimes(1);
  });
});
