import {of} from 'rxjs';
import {RrhhAsistencia} from './rrhh-asistencia';

describe('Attendance request correlation',()=>{
  it('ignores another result and renders the matching persisted result with its employee snapshot',async()=>{
    let notify:(data:any)=>void=()=>{};
    const rows=[{tienda:'QA01',fecha:'2026-10-29'}];
    const store={getStores:()=>of([]),decrypt:()=>'',callRefreshAsistenceEmployes:jasmine.createSpy().and.returnValue(of({asistencia:[{property:'request-b',data:rows},{property:'ejb',data:[]}]}))};
    const socket={onRefreshEmployesEJB:()=>()=>{},onRefreshEmployesAsistence:(callback:any)=>{notify=callback;return()=>{};}};
    const page=new RrhhAsistencia(store as any,socket as any,{} as any);
    spyOn(page,'onEmpleadosList');localStorage.setItem('keyStore','local-test-only');
    try{
      await page.ngOnInit();page.propertyCode='request-b';page.isLoading=true;
      notify({property:'request-a'});expect(store.callRefreshAsistenceEmployes).not.toHaveBeenCalled();
      notify({property:'request-b'});expect(store.callRefreshAsistenceEmployes).toHaveBeenCalledOnceWith('request-b');
      expect(page.dataTable).toEqual(rows);expect(page.isLoading).toBeFalse();
    }finally{page.ngOnDestroy();localStorage.removeItem('keyStore');}
  });
});
