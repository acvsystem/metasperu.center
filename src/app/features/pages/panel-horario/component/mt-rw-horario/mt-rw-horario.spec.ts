import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { MtRwHorario } from './mt-rw-horario';
import { DraftStore } from '@metasperu/page/core/drafts/draft-store';

describe('Schedule draft and submission',()=>{
  let result:Subject<any>,store:any,removed:number,page:MtRwHorario;
  beforeEach(()=>{
    result=new Subject();removed=0;
    store={postRegisterHorarios:jasmine.createSpy().and.returnValue(result),putHorario:jasmine.createSpy().and.returnValue(result)};
    TestBed.configureTestingModule({providers:[{provide:MatDialog,useValue:{}},{provide:DraftStore,useValue:{remove:()=>removed++,save:()=>{}}}]});
    page=TestBed.runInInjectionContext(()=>new MtRwHorario(store,{} as any));
    page.keyStore='QA01';page.hayCambios=true;
    page.horariosProcesados=[{dias:Array.from({length:7},()=>({fecha:'2026-10-29'}))}];
    spyOn(page,'onSearch');
  });
  afterEach(()=>page.ngOnDestroy());
  for(const method of ['guardarHorarioCompleto','editarHorarioCompleto'] as const){
    it(method+' keeps the draft and guard active on failure and blocks double submission',async()=>{
      await page[method]();await page[method]();
      expect(page.isLoading).toBeTrue();expect(page.hayCambios).toBeTrue();
      expect(store[method==='guardarHorarioCompleto'?'postRegisterHorarios':'putHorario']).toHaveBeenCalledTimes(1);
      result.error({message:'No disponible'});
      expect(page.isLoading).toBeFalse();expect(page.canDeactivate()).toBeFalse();expect(removed).toBe(0);
    });
  }
  it('clears only its draft after a confirmed successful save',async()=>{
    await page.guardarHorarioCompleto();result.next({message:'Guardado'});
    expect(page.isLoading).toBeFalse();expect(page.canDeactivate()).toBeTrue();expect(removed).toBe(1);
  });
});
