import { Subject,of } from 'rxjs';
import { MdlUsuarioTienda } from './mdl-usuario-tienda';
describe('Store permission selection',()=>{
  it('waits for both queries and keeps selected stores hidden by the search',()=>{
    const assignments=new Subject<any>(),save=new Subject<any>();
    const service:any={getStores:()=>of([{id:1,nombre:'Primera'},{id:2,nombre:'Segunda'}]),
      postPermissionUserStore:()=>assignments,postAsingPermissionUserStore:jasmine.createSpy().and.returnValue(save)};
    const dialog:any={close:jasmine.createSpy(),disableClose:false};
    const modal=new MdlUsuarioTienda(dialog,{usuario:{ID_LOGIN:7}},service);
    modal.ngOnInit();modal.guardar();expect(service.postAsingPermissionUserStore).not.toHaveBeenCalled();
    assignments.next([{ID_TIENDA_TASG:1},{ID_TIENDA_TASG:2}]);assignments.complete();
    modal.filtrarTiendas({target:{value:'Primera'}} as any);modal.guardar();modal.guardar();
    expect(service.postAsingPermissionUserStore).toHaveBeenCalledOnceWith({ID_USUARIO:7,TIENDAS:[{id:1},{id:2}]});
    save.error({status:503});expect(modal.tiendasSeleccionadas).toEqual([1,2]);expect(dialog.close).not.toHaveBeenCalled();
    modal.ngOnDestroy();
  });
});
